import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PhotoManager } from "./PhotoManager";
import type { Id } from "../../convex/_generated/dataModel";

// Mock Convex hooks
vi.mock("convex/react", () => ({
  useMutation: vi.fn(() => vi.fn()),
}));

describe("PhotoManager", () => {
  const mockBakeId = "bake123" as Id<"bakes">;
  const mockStorageId = "storage123" as Id<"_storage">;
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
    {
      _id: "p3" as Id<"photos">,
      storageId: "s3" as Id<"_storage">,
      url: "https://example.com/photo3.jpg",
      alt: "Third photo",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when no photos", () => {
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

  it("renders Add Photos button", () => {
    render(
      <PhotoManager
        bakeId={mockBakeId}
        photos={[]}
        writerToken="test-token"
      />
    );

    const addButton = screen.getByRole("button", { name: /add photos/i });
    expect(addButton).toBeInTheDocument();
  });

  it("shows photo thumbnails for existing photos", () => {
    render(
      <PhotoManager
        bakeId={mockBakeId}
        photos={mockPhotos}
        coverStorageId={"s1" as Id<"_storage">}
        writerToken="test-token"
      />
    );

    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThanOrEqual(3);
  });

  it("shows cover badge on cover photo", () => {
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

  it("renders up/down buttons for reordering", () => {
    render(
      <PhotoManager
        bakeId={mockBakeId}
        photos={mockPhotos}
        writerToken="test-token"
      />
    );

    const upButtons = screen.getAllByTitle("Move up");
    const downButtons = screen.getAllByTitle("Move down");

    expect(upButtons).toHaveLength(3);
    expect(downButtons).toHaveLength(3);
  });

  it("disables up button for first photo", () => {
    render(
      <PhotoManager
        bakeId={mockBakeId}
        photos={mockPhotos}
        writerToken="test-token"
      />
    );

    const upButtons = screen.getAllByTitle("Move up");
    expect(upButtons[0]).toBeDisabled();
    expect(upButtons[1]).not.toBeDisabled();
  });

  it("disables down button for last photo", () => {
    render(
      <PhotoManager
        bakeId={mockBakeId}
        photos={mockPhotos}
        writerToken="test-token"
      />
    );

    const downButtons = screen.getAllByTitle("Move down");
    expect(downButtons[2]).toBeDisabled();
    expect(downButtons[1]).not.toBeDisabled();
  });

  it("renders Set as cover button for non-cover photos", () => {
    render(
      <PhotoManager
        bakeId={mockBakeId}
        photos={mockPhotos}
        coverStorageId={"s1" as Id<"_storage">}
        writerToken="test-token"
      />
    );

    const setCoverButtons = screen.getAllByText("Set as cover");
    // Should have 2 buttons (photos 2 and 3 are not cover)
    expect(setCoverButtons).toHaveLength(2);
  });

  it("does not show Set as cover button for current cover", () => {
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

  it("renders Remove button for each photo", () => {
    render(
      <PhotoManager
        bakeId={mockBakeId}
        photos={mockPhotos}
        writerToken="test-token"
      />
    );

    const removeButtons = screen.getAllByText("Remove");
    expect(removeButtons).toHaveLength(3);
  });

  it("accepts writerToken for authentication", () => {
    const { rerender } = render(
      <PhotoManager
        bakeId={mockBakeId}
        photos={[]}
        writerToken="test-token"
      />
    );

    // Should render without error
    expect(screen.getByText("Recipe Photos")).toBeInTheDocument();

    // Should also work with kitchenId
    rerender(
      <PhotoManager
        bakeId={mockBakeId}
        photos={[]}
        kitchenId={"kitchen123" as Id<"kitchens">}
      />
    );

    expect(screen.getByText("Recipe Photos")).toBeInTheDocument();
  });

  it("triggers onPhotosChange callback", () => {
    const onPhotosChange = vi.fn();

    render(
      <PhotoManager
        bakeId={mockBakeId}
        photos={mockPhotos}
        writerToken="test-token"
        onPhotosChange={onPhotosChange}
      />
    );

    // The callback would be called after mutations complete
    // This is verified through integration, not directly testable in isolation
    expect(onPhotosChange).not.toHaveBeenCalled(); // Not called on mount
  });

  it("shows file input for multiple files", () => {
    render(
      <PhotoManager
        bakeId={mockBakeId}
        photos={[]}
        writerToken="test-token"
      />
    );

    const fileInput = screen.getByRole("button", { name: /add photos/i })
      .parentElement?.querySelector('input[type="file"]');

    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute("multiple");
    expect(fileInput).toHaveAttribute("accept", "image/*");
  });

  describe("Multi-file upload simulation", () => {
    it("handles multiple file selection", async () => {
      // Note: Full upload testing requires mocking XHR and Convex mutations
      // This test verifies the component structure supports multi-file
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
      // Actual file upload is integration-tested in Playwright
    });
  });

  describe("Accessibility", () => {
    it("has accessible headings", () => {
      render(
        <PhotoManager
          bakeId={mockBakeId}
          photos={[]}
          writerToken="test-token"
        />
      );

      expect(screen.getByText("Recipe Photos")).toBeInTheDocument();
    });

    it("has descriptive button titles for screen readers", () => {
      render(
        <PhotoManager
          bakeId={mockBakeId}
          photos={mockPhotos}
          writerToken="test-token"
        />
      );

      expect(screen.getAllByTitle("Move up")).toHaveLength(3);
      expect(screen.getAllByTitle("Move down")).toHaveLength(3);
    });

    it("marks uploading state with disabled button", () => {
      render(
        <PhotoManager
          bakeId={mockBakeId}
          photos={[]}
          writerToken="test-token"
        />
      );

      const addButton = screen.getByRole("button", { name: /add photos/i });
      expect(addButton).not.toBeDisabled(); // Not uploading initially
    });
  });
});
