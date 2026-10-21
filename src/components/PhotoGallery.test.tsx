import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PhotoGallery } from "./PhotoGallery";

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
    
    // Should not show thumbnail navigation for single photo
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });

  it("renders multiple photos with thumbnail navigation", () => {
    render(
      <PhotoGallery photos={mockPhotos} title="Test Recipe" />
    );
    
    // Should show thumbnail navigation
    const tablist = screen.getByRole("tablist");
    expect(tablist).toBeInTheDocument();
    expect(tablist).toHaveAccessibleName("Test Recipe photos");
    
    // Should have one button per photo
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
  });

  it("shows first photo as selected by default", () => {
    render(
      <PhotoGallery photos={mockPhotos} title="Test Recipe" />
    );
    
    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
    expect(tabs[2]).toHaveAttribute("aria-selected", "false");
  });

  it("switches photos when clicking thumbnails", () => {
    render(
      <PhotoGallery photos={mockPhotos} title="Test Recipe" />
    );
    
    const tabs = screen.getAllByRole("tab");
    
    // Click second thumbnail
    fireEvent.click(tabs[1]);
    
    // Second photo should now be selected
    expect(tabs[0]).toHaveAttribute("aria-selected", "false");
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs[2]).toHaveAttribute("aria-selected", "false");
  });

  it("has accessible labels for each thumbnail", () => {
    render(
      <PhotoGallery photos={mockPhotos} title="Test Recipe" />
    );
    
    expect(screen.getByLabelText("Photo 1: First photo")).toBeInTheDocument();
    expect(screen.getByLabelText("Photo 2: Second photo")).toBeInTheDocument();
    expect(screen.getByLabelText("Photo 3: Third photo")).toBeInTheDocument();
  });

  it("renders all photos passed including those with null URLs", () => {
    // Note: In practice, BakePage filters out null URLs before passing to PhotoGallery
    // But the component itself doesn't filter - it just renders what it receives
    const photosWithNull = [
      { url: "https://example.com/photo1.jpg", alt: "First photo" },
      { url: null as unknown as string, alt: "Missing photo" },
      { url: "https://example.com/photo3.jpg", alt: "Third photo" },
    ];
    
    render(
      <PhotoGallery photos={photosWithNull} title="Test Recipe" />
    );
    
    // Should show 3 thumbnails (component doesn't filter)
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
  });
});
