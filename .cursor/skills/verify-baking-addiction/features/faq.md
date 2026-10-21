# Feature: FAQ

## Sub-features

- Public FAQ page at `/faq`
- Frequently asked questions and answers
- Information about the family cookbook
- Link back to home or join page

## How to get to it

1. Navigate to http://localhost:4821/faq
2. FAQ page loads with questions and answers

Or: Click "FAQ" link from join page or site footer

## Driving it with Playwright

**Test file:** `tests/verify/faq.spec.ts`

**Key selectors:**

- Page heading: `h1` with text "FAQ" or "Frequently Asked Questions"
- Question headings: `h2` or `h3` with question text
- Answer paragraphs: `p` following question headings
- Home link: `role=link` with text "Back to the book" or home URL

**User journey:**

```typescript
// Navigate to FAQ
await page.goto('/faq');
await expect(page).toHaveTitle(/faq/i);

// Verify page content
await expect(page.getByRole('heading', { name: /faq|questions/i })).toBeVisible();
await page.screenshot({ path: 'artifacts/verify/screenshots/faq-page.png' });

// Verify questions render
const questions = page.getByRole('heading', { level: 2 });
await expect(questions.first()).toBeVisible();

// Verify navigation back to home
const homeLink = page.getByRole('link', { name: /back|home/i });
await expect(homeLink).toHaveAttribute('href', '/');
```

## Gotchas

- **Public page** — No auth required, accessible to anyone
- **Static content** — FAQ text is hardcoded in component, not from database
- **Smoke tests** — Already covered by existing `tests/smoke.spec.ts`
- **SEO** — FAQ page should have proper meta tags and structured data
- **Mobile responsive** — Text should wrap properly on small screens
