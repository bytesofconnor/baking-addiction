import { useState } from "react";
import { PhotoFrame } from "@/components/PhotoFrame";

type Photo = {
  url: string | null;
  alt: string;
};

type PhotoGalleryProps = {
  photos: Photo[];
  title: string;
};

export function PhotoGallery({ photos, title }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (photos.length === 0) {
    return null;
  }

  if (photos.length === 1) {
    const photo = photos[0];
    return photo?.url ? (
      <PhotoFrame src={photo.url} alt={photo.alt} size="hero" />
    ) : null;
  }

  const selected = photos[selectedIndex];
  if (!selected) {
    return null;
  }

  return (
    <div className="photo-gallery">
      <div className="photo-gallery-main">
        {selected.url && (
          <PhotoFrame src={selected.url} alt={selected.alt} size="hero" />
        )}
      </div>

      <div
        className="photo-gallery-thumbs"
        role="tablist"
        aria-label={`${title} photos`}
      >
        {photos.map((photo, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={index === selectedIndex}
            aria-label={`Photo ${index + 1}: ${photo.alt}`}
            className={`photo-gallery-thumb ${
              index === selectedIndex ? "photo-gallery-thumb-selected" : ""
            }`}
            onClick={() => setSelectedIndex(index)}
          >
            {photo.url && (
              <img
                src={photo.url}
                alt=""
                className="photo-gallery-thumb-img"
              />
            )}
          </button>
        ))}
      </div>

      <style>{`
        .photo-gallery {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .photo-gallery-main {
          width: 100%;
        }

        .photo-gallery-thumbs {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding: 0.25rem;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
        }

        .photo-gallery-thumbs::-webkit-scrollbar {
          height: 6px;
        }

        .photo-gallery-thumbs::-webkit-scrollbar-track {
          background: var(--color-line);
          border-radius: 3px;
        }

        .photo-gallery-thumbs::-webkit-scrollbar-thumb {
          background: var(--color-ink-soft);
          border-radius: 3px;
        }

        .photo-gallery-thumb {
          flex-shrink: 0;
          width: 80px;
          height: 80px;
          border: 2px solid transparent;
          border-radius: 0.5rem;
          overflow: hidden;
          cursor: pointer;
          background: var(--color-line);
          padding: 0;
          transition: border-color 0.2s ease;
        }

        .photo-gallery-thumb:hover {
          border-color: var(--color-ink-soft);
        }

        .photo-gallery-thumb-selected {
          border-color: var(--color-teal);
        }

        .photo-gallery-thumb:focus-visible {
          outline: 2px solid var(--color-teal);
          outline-offset: 2px;
        }

        .photo-gallery-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        @media (max-width: 640px) {
          .photo-gallery-thumbs {
            gap: 0.375rem;
          }

          .photo-gallery-thumb {
            width: 60px;
            height: 60px;
          }
        }
      `}</style>
    </div>
  );
}
