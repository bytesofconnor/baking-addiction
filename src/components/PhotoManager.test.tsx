import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PhotoManager } from "./PhotoManager";
import type { Id } from "../../convex/_generated/dataModel";

/**
 * PhotoManager behavior tests.
 * Focus on user-facing functionality rather than implementation details.
 * Full upload and mutation testing is done in Playwright integration tests.
 */

vi.mock("convex/react", () => ({
  useMutation: vi.fn(() => vi.fn()),
}));

describe("PhotoManager", () => {
  const mockBakeId = "bake123" as Id<"bakes">;
  const mockPhotos = [
    {
      _id: "p1" as Id<"photos">,
      storageId: "s1" as Id<"_storage">,
      url: "https://example.com/photo1.jpg",
      alt: "First photo",
    },
    {
      _id: "p2" as Id<"photos">,
      storageId: "s2" as Id<"_storage">,
      url: "https://example.com/photo2.jpg",
      alt: "Second photo",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows empty state when no photos exist", () => {
    render(
      <PhotoManager
        bakeId={mockBakeId}
        photos={[]}
        writerToken="test-token"
      />
    );

    expect(
      screen.getByText("No photos yet. Add some to show on the recipe page.")
    ).toBeInTheDocument();
  });

  it("displays cover badge on the cover photo", () => {
    render(
      <PhotoManager
        bakeId={mockBakeId}
        photos={mockPhotos}
        coverStorageId={"s1" as Id<"_storage">}
        writerToken="test-token"
      />
    );

    expect(screen.getByText("Cover")).toBeInTheDocument();
  });

  it("disables move up for first photo and move down for last photo", () => {
    render(
      <PhotoManager
        bakeId={mockBakeId}
        photos={mockPhotos}
        writerToken="test-token"
      />
    );

    const upButtons = screen.getAllByTitle("Move up");
    const downButtons = screen.getAllByTitle("Move down");

    expect(upButtons[0]).toBeDisabled();
    expect(downButtons[downButtons.length - 1]).toBeDisabled();
  });

  it("hides Set as cover button for the current cover photo", () => {
    render(
      <PhotoManager
        bakeId={mockBakeId}
        photos={[mockPhotos[0]!]}
        coverStorageId={"s1" as Id<"_storage">}
        writerToken="test-token"
      />
    );

    expect(screen.queryByText("Set as cover")).not.toBeInTheDocument();
  });

  it("allows multiple file selection for uploads", () => {
    render(
      <PhotoManager
        bakeId={mockBakeId}
        photos={[]}
        writerToken="test-token"
      />
    );

    const fileInput = screen.getByRole("button", { name: /add photos/i })
      .parentElement?.querySelector('input[type="file"]');

    expect(fileInput).toHaveAttribute("multiple");
    expect(fileInput).toHaveAttribute("accept", "image/*");
  });
});
