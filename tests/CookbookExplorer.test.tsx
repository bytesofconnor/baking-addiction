import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { CookbookExplorer } from "@/components/CookbookExplorer";

describe("CookbookExplorer", () => {
  it("shows clear button when typing in search, clears on click", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CookbookExplorer bakes={[]} />
      </MemoryRouter>,
    );

    const searchInput = screen.getByPlaceholderText(
      "Search recipes — pumpkin, chocolate…",
    );
    expect(searchInput).toBeInTheDocument();

    const clearButton = screen.queryByRole("button", { name: "Clear search" });
    expect(clearButton).not.toBeInTheDocument();

    await user.type(searchInput, "chocolate");

    expect(searchInput).toHaveValue("chocolate");

    const clearButtonAfterTyping = screen.getByRole("button", {
      name: "Clear search",
    });
    expect(clearButtonAfterTyping).toBeInTheDocument();
    expect(clearButtonAfterTyping).toBeVisible();

    await user.click(clearButtonAfterTyping);

    expect(searchInput).toHaveValue("");

    expect(
      screen.queryByRole("button", { name: "Clear search" }),
    ).not.toBeInTheDocument();
  });
});
