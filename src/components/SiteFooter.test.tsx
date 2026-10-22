/**
 * @vitest-environment happy-dom
 *
 * Site footer behavior: year, credit link, and no personal names.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { SiteFooter } from "./SiteFooter";
import { SITE_NAME } from "@/lib/site";

const PERSON_NAME = /\b(mom|mom|mom|connor|mom)\b/i;

describe("SiteFooter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2028-03-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the computed copyright year and family kitchen line", () => {
    render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(`© 2028 ${SITE_NAME} · Made with love in our family kitchen`),
    ).toBeInTheDocument();
  });

  it("credits Sally with a safe outbound link", () => {
    render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );

    const credit = screen.getByRole("link", { name: /sally/i });
    expect(credit).toHaveAttribute("href", "https://sallysbakingaddiction.com");
    expect(credit).toHaveAttribute("rel", "noopener");
    expect(credit).toHaveAttribute("target", "_blank");
    expect(credit.textContent).toMatch(/sally/i);
  });

  it("links Home and All recipes to the cookbook root", () => {
    render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "All recipes" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("does not name any person", () => {
    const { container } = render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );

    expect(container.textContent ?? "").not.toMatch(PERSON_NAME);
  });
});
