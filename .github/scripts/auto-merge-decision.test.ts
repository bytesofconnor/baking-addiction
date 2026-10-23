// @vitest-environment node

import { describe, expect, it } from "vitest";
import { decideDeploy, decideMerge } from "./auto-merge-decision.mjs";

const repo = "bytesofconnor/baking-addiction";

function mergeSnapshot(
  overrides: Partial<{
    headRepo: string;
    baseRepo: string;
    baseRef: string;
    headRef: string;
    actor: string;
    draft: boolean;
    paths: string[];
  }> = {},
) {
  return {
    headRepo: repo,
    baseRepo: repo,
    baseRef: "main",
    headRef: "cursor/add-automerge-d212",
    actor: "octocat",
    draft: false,
    paths: ["src/App.tsx"],
    ...overrides,
  };
}

function pull(overrides: Partial<{
  state: "OPEN" | "CLOSED" | "MERGED";
  mergedAt: string | null;
  mergeCommitOid: string | null;
  mergedBy: string | null;
}> = {}) {
  return {
    state: "OPEN" as const,
    mergedAt: null,
    mergeCommitOid: null,
    mergedBy: null,
    ...overrides,
  };
}

describe("decideMerge", () => {
  it("merges a cursor branch that stays outside protected paths", () => {
    expect(decideMerge(mergeSnapshot())).toEqual({
      merge: true,
      reason: "cursor branch",
    });
  });

  it("merges a cursor branch that only adds src/AGENTS.md", () => {
    expect(
      decideMerge(mergeSnapshot({ paths: ["src/AGENTS.md"] })),
    ).toEqual({ merge: true, reason: "cursor branch" });
  });

  it("skips a cursor branch that edits .github", () => {
    expect(
      decideMerge(
        mergeSnapshot({ paths: [".github/workflows/auto-merge.yml"] }),
      ),
    ).toEqual({
      merge: false,
      reason: "cursor branch touches a protected path",
    });
  });

  it("skips a cursor branch that edits .cursor/rules", () => {
    expect(
      decideMerge(
        mergeSnapshot({ paths: [".cursor/rules/accessibility.mdc"] }),
      ),
    ).toEqual({
      merge: false,
      reason: "cursor branch touches a protected path",
    });
  });

  it("skips a cursor branch that edits the root AGENTS.md", () => {
    expect(decideMerge(mergeSnapshot({ paths: ["AGENTS.md"] }))).toEqual({
      merge: false,
      reason: "cursor branch touches a protected path",
    });
  });

  it("skips a nested cursor ref", () => {
    expect(
      decideMerge(mergeSnapshot({ headRef: "cursor/nested/name" })),
    ).toEqual({
      merge: false,
      reason: "not a cursor branch or dependabot",
    });
  });

  it("merges a Dependabot major that edits a workflow", () => {
    expect(
      decideMerge(
        mergeSnapshot({
          actor: "dependabot[bot]",
          headRef: "dependabot/github_actions/dependabot/fetch-metadata-3",
          paths: [".github/workflows/deploy.yml"],
        }),
      ),
    ).toEqual({ merge: true, reason: "dependabot" });
  });

  it("skips Dependabot when the head repo is a fork", () => {
    expect(
      decideMerge(
        mergeSnapshot({
          actor: "dependabot[bot]",
          headRepo: "other/baking-addiction",
        }),
      ),
    ).toEqual({ merge: false, reason: "fork" });
  });

  it("skips a fork even when the branch matches cursor/*", () => {
    expect(
      decideMerge(mergeSnapshot({ headRepo: "other/baking-addiction" })),
    ).toEqual({ merge: false, reason: "fork" });
  });

  it("skips a draft cursor branch", () => {
    expect(decideMerge(mergeSnapshot({ draft: true }))).toEqual({
      merge: false,
      reason: "draft",
    });
  });

  it("skips a pull request whose base is not main", () => {
    expect(decideMerge(mergeSnapshot({ baseRef: "develop" }))).toEqual({
      merge: false,
      reason: "base is not main",
    });
  });

  it("skips a same-repo human branch", () => {
    expect(
      decideMerge(mergeSnapshot({ headRef: "feature/thing" })),
    ).toEqual({
      merge: false,
      reason: "not a cursor branch or dependabot",
    });
  });
});

describe("decideDeploy", () => {
  const oid = "abc123";
  const checksUpdatedAt = "2026-10-23T15:00:00.000Z";

  it("deploys the merge commit when this run merged the pull request", () => {
    expect(
      decideDeploy({
        eventName: "pull_request",
        before: pull(),
        after: pull({
          state: "MERGED",
          mergedAt: "2026-10-23T15:01:00.000Z",
          mergeCommitOid: oid,
          mergedBy: "github-actions[bot]",
        }),
        checksUpdatedAt: null,
      }),
    ).toEqual({ sha: oid });
  });

  it("deploys when workflow_run finds a token merge inside the checks window", () => {
    const merged = pull({
      state: "MERGED",
      mergedAt: "2026-10-23T15:01:00.000Z",
      mergeCommitOid: oid,
      mergedBy: "github-actions[bot]",
    });
    expect(
      decideDeploy({
        eventName: "workflow_run",
        before: merged,
        after: merged,
        checksUpdatedAt,
      }),
    ).toEqual({ sha: oid });
  });

  it("does not deploy an already merged token commit from the pull_request event", () => {
    const merged = pull({
      state: "MERGED",
      mergedAt: "2026-10-23T15:01:00.000Z",
      mergeCommitOid: oid,
      mergedBy: "github-actions[bot]",
    });
    expect(
      decideDeploy({
        eventName: "pull_request",
        before: merged,
        after: merged,
        checksUpdatedAt,
      }),
    ).toEqual({ sha: "" });
  });

  it("does not deploy a merge performed by a person", () => {
    expect(
      decideDeploy({
        eventName: "workflow_run",
        before: pull(),
        after: pull({
          state: "MERGED",
          mergedAt: "2026-10-23T15:01:00.000Z",
          mergeCommitOid: oid,
          mergedBy: "octocat",
        }),
        checksUpdatedAt,
      }),
    ).toEqual({ sha: "" });
  });

  it("does not deploy a token merge from a later re-run of PR Checks", () => {
    const merged = pull({
      state: "MERGED",
      mergedAt: "2026-10-23T15:01:00.000Z",
      mergeCommitOid: oid,
      mergedBy: "github-actions[bot]",
    });
    expect(
      decideDeploy({
        eventName: "workflow_run",
        before: merged,
        after: merged,
        checksUpdatedAt: "2026-10-23T16:00:00.000Z",
      }),
    ).toEqual({ sha: "" });
  });

  it("does not deploy while the pull request is still open", () => {
    expect(
      decideDeploy({
        eventName: "workflow_run",
        before: pull(),
        after: pull(),
        checksUpdatedAt,
      }),
    ).toEqual({ sha: "" });
  });
});
