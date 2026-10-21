import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PhotoGallery } from "./PhotoGallery";

/**
 * PhotoGallery behavior tests.
 * These verify user-facing functionality, not implementation details.
 */

describe("PhotoGallery", () => {
  const mockPhotos = [
    { url: "https://example.com/photo1.jpg", alt: "First photo" },
    { url: "https://example.com/photo2.jpg", alt: "Second photo" },
    { url: "https://example.com/photo3.jpg", alt: "Third photo" },
  ];

  it("renders nothing when no photos provided", () => {
    const { container } = render(
      <PhotoGallery photos={[]} title="Test Recipe" />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders single photo without thumbnails", () => {
    render(
      <PhotoGallery photos={[mockPhotos[0]]} title="Test Recipe" />
    );
    
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });

  it("switches displayed photo when user clicks thumbnail", () => {
    render(
      <PhotoGallery photos={mockPhotos} title="Test Recipe" />
    );
    
    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    
    fireEvent.click(tabs[1]);
    
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveAttribute("aria-selected", "false");
  });

  it("has accessible labels for screen readers", () => {
    render(
      <PhotoGallery photos={mockPhotos} title="Test Recipe" />
    );
    
    expect(screen.getByLabelText("Photo 1: First photo")).toBeInTheDocument();
    expect(screen.getByLabelText("Photo 2: Second photo")).toBeInTheDocument();
    expect(screen.getByLabelText("Photo 3: Third photo")).toBeInTheDocument();
  });
});
