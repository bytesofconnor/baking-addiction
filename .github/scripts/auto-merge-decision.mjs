import { pathToFileURL } from "node:url";

/**
 * @typedef {"OPEN" | "CLOSED" | "MERGED"} PullStateName
 *
 * @typedef {{
 *   headRepo: string,
 *   baseRepo: string,
 *   baseRef: string,
 *   headRef: string,
 *   actor: string,
 *   draft: boolean,
 *   paths: string[]
 * }} MergeSnapshot
 *
 * @typedef {{ merge: boolean, reason: string }} MergeDecision
 *
 * @typedef {{
 *   state: PullStateName,
 *   mergedAt: string | null,
 *   mergeCommitOid: string | null,
 *   mergedBy: string | null
 * }} PullState
 *
 * @typedef {{
 *   eventName: "pull_request" | "workflow_run",
 *   before: PullState,
 *   after: PullState,
 *   checksUpdatedAt: string | null
 * }} DeploySnapshot
 *
 * @typedef {{ sha: string }} DeployDecision
 */

const CURSOR_BRANCH = /^cursor\/[^/]+$/;
const TWO_MINUTES_MS = 2 * 60 * 1000;
const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

/**
 * @param {string} path
 * @returns {boolean}
 */
export function isProtectedPath(path) {
  return (
    path === "AGENTS.md" ||
    path.startsWith(".github/") ||
    path.startsWith(".cursor/rules/")
  );
}

/**
 * @param {MergeSnapshot} snapshot
 * @returns {MergeDecision}
 */
export function decideMerge(snapshot) {
  if (snapshot.baseRef !== "main") {
    return { merge: false, reason: "base is not main" };
  }
  if (snapshot.headRepo !== snapshot.baseRepo) {
    return { merge: false, reason: "fork" };
  }
  if (snapshot.draft) {
    return { merge: false, reason: "draft" };
  }
  if (snapshot.actor === "dependabot[bot]") {
    return { merge: true, reason: "dependabot" };
  }
  if (CURSOR_BRANCH.test(snapshot.headRef)) {
    const protectedPaths = snapshot.paths.filter(isProtectedPath);
    if (protectedPaths.length > 0) {
      return { merge: false, reason: "cursor branch touches a protected path" };
    }
    return { merge: true, reason: "cursor branch" };
  }
  return { merge: false, reason: "not a cursor branch or dependabot" };
}

/**
 * @param {DeploySnapshot} snapshot
 * @returns {DeployDecision}
 */
export function decideDeploy(snapshot) {
  const sha = snapshot.after.mergeCommitOid ?? "";
  const mergedByActions =
    snapshot.after.state === "MERGED" &&
    snapshot.after.mergedBy === "github-actions[bot]" &&
    sha !== "";
  if (!mergedByActions) {
    return { sha: "" };
  }
  if (snapshot.before.state !== "MERGED") {
    return { sha };
  }
  if (
    snapshot.eventName === "workflow_run" &&
    mergedAfterChecks(snapshot.after.mergedAt, snapshot.checksUpdatedAt)
  ) {
    return { sha };
  }
  return { sha: "" };
}

/**
 * @param {string | null} mergedAt
 * @param {string | null} checksUpdatedAt
 * @returns {boolean}
 */
function mergedAfterChecks(mergedAt, checksUpdatedAt) {
  if (!mergedAt || !checksUpdatedAt) {
    return false;
  }
  const merged = Date.parse(mergedAt);
  const checks = Date.parse(checksUpdatedAt);
  if (Number.isNaN(merged) || Number.isNaN(checks)) {
    return false;
  }
  return (
    merged >= checks - TWO_MINUTES_MS && merged <= checks + FIFTEEN_MINUTES_MS
  );
}

const isCli =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
  const command = process.argv[2];
  const raw = await readStdin();
  const input = JSON.parse(raw);
  if (command === "merge") {
    process.stdout.write(JSON.stringify(decideMerge(input)));
  } else if (command === "deploy") {
    process.stdout.write(JSON.stringify(decideDeploy(input)));
  } else {
    process.stderr.write("usage: auto-merge-decision.mjs merge|deploy\n");
    process.exit(2);
  }
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}
