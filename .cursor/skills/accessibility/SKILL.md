# Accessibility

**Ship UI everyone in the family can use — keyboard, screen reader, phone, and desktop.**

## Principle

The Family Recipe Book is a private kitchen tool, not a demo. A non-technical person writes recipes through the `/add` forms. If a control cannot be found, read, or tapped, the feature does not work.

Follow this skill on every UI, form, or route change. Tie the work to:

- **prove it works** — run the real page; read the real axe, keyboard, and tap-target result
- **test behavior, not implementation** — can a person reach the control, read the label, and use it?
- **blast radius** — a shared button, dock, or form primitive is used on more than the page you opened

## Must follow

1. **Semantic HTML.** Headings in order. `main` for the page. `nav` for section switches. Real `<button>` and `<a>`. Native `<details>`/`<summary>` beats a homemade accordion.
2. **Labels for every form input.** Visible `<label htmlFor>` (or the `Label` primitive) on write-desk and kitchen fields. Placeholders and nearby text do not count. File pickers and date fields too.
3. **Alt text for recipe photos.** Describe the dish. Decorative cover art, doodles, and marks use `alt=""` and `aria-hidden` when they are not content.
4. **Color contrast AA.** Text and controls meet WCAG 2.1 AA. Focus and errors cannot be color-only.
5. **Focus states.** `:focus-visible` stays visible. Never `outline: none` without a stronger ring.
6. **Reduced motion.** Cover opens, page turns, and toasts honor `prefers-reduced-motion`.
7. **44px touch targets.** Primary controls are at least 44×44px on a 390×844 viewport. The bottom dock must not cover the last line or the save action — pad with `--dock-clearance`.
8. **Both viewports.** Verify desktop 1280×800 and mobile 390×844. Layout that works on one is not done.
9. **Tests travel with the UI.** New page or interactive component → add or update `tests/a11y.spec.ts` (or a focused spec). Fail on serious/critical axe violations with WCAG 2.1 AA tags. Do not disable rules or skip tests to go green. If a surface needs a live Convex backend, say so in the PR.

## In Practice

❌ **Don't:**
- Ship a form field the write desk user has to guess
- Use a clickable `div` because the styles were easier
- Hide the last FAQ line or a footer under the phone dock
- Leave recipe `<img>` with empty `alt` when the photo is the dish
- Disable an axe rule or `test.skip` a viewport to pass CI

✅ **Do:**
- Tab through the changed screen with a visible ring on every control
- Check the write-desk labels by reading the page, not the JSX
- Run `npx playwright test tests/a11y.spec.ts` after UI changes
- Name the blast radius: dock, buttons, labels, and routes that reuse the primitive

## Pages CI can see

Playwright scans public pages without a live Convex backend: the join cover (`/join`), the invited cover (`/join?invite=`), FAQ (`/faq`), and invalid slips (`/slip/short`).

Signed-in write desk (`/add`), recipe edit (`/add?edit=`), You / family editors, and the admin preview bar are scanned with the local `vite --mode a11y` fixture (generic kitchen data). That build never talks to production Convex and never uses real credentials. The FamilyDoor that appears only after a live `peekInvite` is still out of reach — say so in the PR when a check could not run.

## Why It Matters

Family members should not need a mouse, a large monitor, or a developer to add a recipe. Accessibility is how the book stays usable.

**If it cannot be used, it is not shipped.**
