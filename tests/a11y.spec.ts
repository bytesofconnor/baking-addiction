import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Enforced accessibility checks for public pages that render without a
 * live Convex backend. Signed-in book pages, the write desk, and the
 * FamilyDoor that appears only after `peekInvite` succeeds are not
 * reachable here — see the PR report, not a skipped test.
 */

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 390, height: 844 },
] as const;

const WCAG_AA_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] as const;
const FAIL_IMPACTS = new Set(["serious", "critical"]);
const MIN_TAP = 44;

type PublicPage = {
  name: string;
  path: string;
  ready: string;
  controls: string[];
};

const PUBLIC_PAGES: PublicPage[] = [
  {
    name: "join cover",
    path: "/join",
    ready: "Continue with Google",
    controls: [
      "Continue with Google",
      "Join",
      "FAQ",
    ],
  },
  {
    name: "invite door",
    path: "/join?invite=family-link",
    ready: "You’ve been invited",
    controls: [
      "Continue with Google",
      "Join",
      "FAQ",
    ],
  },
  {
    name: "FAQ",
    path: "/faq",
    ready: "Before you open the book.",
    controls: [
      "Join",
      "FAQ",
      "Who’s it for?",
    ],
  },
  {
    name: "invalid slip",
    path: "/slip/short",
    ready: "This slip doesn’t open.",
    controls: [],
  },
];

function formatViolations(
  violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"],
) {
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => `    - ${node.target.join(" ")}`)
        .join("\n");
      return `  ${violation.id} [${violation.impact}] ${violation.help}\n${nodes}`;
    })
    .join("\n");
}

async function openPublicPage(
  page: Page,
  route: PublicPage,
  viewport: (typeof VIEWPORTS)[number],
) {
  await page.setViewportSize({
    width: viewport.width,
    height: viewport.height,
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route.path);
  await expect(
    page.getByText(route.ready, { exact: false }).first(),
  ).toBeVisible({ timeout: 20_000 });
}

function visibleControl(page: Page, name: string): Locator {
  return page.getByRole("button", { name }).or(page.getByRole("link", { name }));
}

async function firstVisible(locator: Locator): Promise<Locator | null> {
  const count = await locator.count();
  for (let index = 0; index < count; index += 1) {
    const candidate = locator.nth(index);
    if (await candidate.isVisible()) {
      return candidate;
    }
  }
  return null;
}

async function tabToControl(page: Page, name: string) {
  const control = await firstVisible(visibleControl(page, name));
  expect(control, `Expected a visible control named "${name}"`).not.toBeNull();

  for (let step = 0; step < 24; step += 1) {
    await page.keyboard.press("Tab");
    const focused = await control!.evaluate(
      (node) => node === document.activeElement || node.contains(document.activeElement),
    );
    if (focused) {
      return control!;
    }
  }

  throw new Error(`Keyboard tab order never reached "${name}"`);
}

async function focusedHasVisibleRing(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!(el instanceof HTMLElement) || el === document.body) {
      return false;
    }
    const styles = getComputedStyle(el);
    const outline =
      styles.outlineStyle !== "none" &&
      styles.outlineWidth !== "0px" &&
      styles.outlineColor !== "rgba(0, 0, 0, 0)";
    const shadow = styles.boxShadow !== "none";
    return outline || shadow;
  });
}

test.describe("public page accessibility", () => {
  for (const viewport of VIEWPORTS) {
    for (const route of PUBLIC_PAGES) {
      test(`${route.name} @ ${viewport.name}: no serious/critical WCAG 2.1 AA`, async ({
        page,
      }) => {
        await openPublicPage(page, route, viewport);

        const results = await new AxeBuilder({ page })
          .withTags([...WCAG_AA_TAGS])
          .analyze();

        const blocking = results.violations.filter((violation) =>
          FAIL_IMPACTS.has(violation.impact ?? ""),
        );

        expect(
          blocking,
          blocking.length
            ? `Serious/critical a11y violations on ${route.path} (${viewport.name}):\n${formatViolations(blocking)}`
            : undefined,
        ).toEqual([]);
      });
    }

    test(`keyboard reaches main controls with visible focus @ ${viewport.name}`, async ({
      page,
    }) => {
      const routes = PUBLIC_PAGES.filter((route) => route.controls.length > 0);

      for (const route of routes) {
        await openPublicPage(page, route, viewport);

        for (const name of route.controls) {
          const control = await firstVisible(visibleControl(page, name));
          if (!control) {
            continue;
          }
          await tabToControl(page, name);
          expect(
            await focusedHasVisibleRing(page),
            `Focused "${name}" on ${route.path} (${viewport.name}) has no visible focus ring`,
          ).toBe(true);
        }
      }
    });
  }

  test("mobile primary controls are at least 44x44", async ({ page }) => {
    const viewport = VIEWPORTS.find((item) => item.name === "mobile")!;

    for (const route of PUBLIC_PAGES) {
      await openPublicPage(page, route, viewport);

      const names = [...route.controls];
      if (route.path === "/faq") {
        names.push("Front cover");
      }

      for (const name of names) {
        const control = await firstVisible(visibleControl(page, name));
        if (!control) {
          continue;
        }
        const box = await control.boundingBox();
        expect(box, `Missing box for "${name}" on ${route.path}`).toBeTruthy();
        expect(
          box!.width,
          `"${name}" on ${route.path} is ${box!.width.toFixed(1)}px wide`,
        ).toBeGreaterThanOrEqual(MIN_TAP);
        expect(
          box!.height,
          `"${name}" on ${route.path} is ${box!.height.toFixed(1)}px tall`,
        ).toBeGreaterThanOrEqual(MIN_TAP);
      }
    }
  });

  test("mobile dock does not hide page content", async ({ page }) => {
    const viewport = VIEWPORTS.find((item) => item.name === "mobile")!;
    const docked = PUBLIC_PAGES.filter((route) => route.path !== "/slip/short");

    for (const route of docked) {
      await openPublicPage(page, route, viewport);

      const dock = page.locator(".book-dock");
      await expect(dock, `Dock missing on ${route.path}`).toBeVisible();
      const dockBox = await dock.boundingBox();
      expect(dockBox).toBeTruthy();

      await page.evaluate(() => {
        const root = document.scrollingElement;
        root?.scrollTo(0, root.scrollHeight);
      });

      const hidden = await page.evaluate((dockTop) => {
        const blocked: string[] = [];
        const candidates = document.querySelectorAll(
          "h1, .book-cover-cta, .book-cover-proof, .book-back-proof, .site-footer",
        );

        for (const node of candidates) {
          if (!(node instanceof HTMLElement)) {
            continue;
          }
          if (node.closest("[inert], [aria-hidden='true']")) {
            continue;
          }
          const styles = getComputedStyle(node);
          if (styles.display === "none" || styles.visibility === "hidden") {
            continue;
          }
          const rect = node.getBoundingClientRect();
          if (rect.height < 8 || rect.width < 8) {
            continue;
          }
          if (rect.bottom > dockTop + 4) {
            blocked.push(
              `${node.tagName.toLowerCase()}${node.className ? `.${String(node.className).split(" ")[0]}` : ""} bottom=${Math.round(rect.bottom)} dock=${Math.round(dockTop)}`,
            );
          }
        }

        return blocked;
      }, dockBox!.y);

      expect(
        hidden,
        `Content sits under the dock on ${route.path}:\n${hidden.join("\n")}`,
      ).toEqual([]);
    }
  });
});
