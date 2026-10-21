import { useMutation } from "convex/react";
import { useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

type Photo = {
  _id: Id<"photos">;
  storageId: Id<"_storage">;
  url: string | null;
  alt: string;
};

type PhotoManagerProps = {
  bakeId: Id<"bakes">;
  photos: Photo[];
  coverStorageId?: Id<"_storage">;
  writerToken?: string;
  kitchenId?: Id<"kitchens">;
  onPhotosChange?: () => void;
};

export function PhotoManager({
  bakeId,
  photos,
  coverStorageId,
  writerToken,
  kitchenId,
  onPhotosChange,
}: PhotoManagerProps) {
  const generateUploadUrl = useMutation(api.photos.generateUploadUrl);
  const attachPhoto = useMutation(api.photos.attach);
  const removePhoto = useMutation(api.photos.remove);
  const setCover = useMutation(api.photos.setCover);
  const reorderPhotos = useMutation(api.photos.reorder);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const writeAccess = {
    ...(writerToken ? { writerToken } : {}),
    ...(kitchenId ? { kitchenId } : {}),
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const fileArray = Array.from(files);

    try {
      for (const [index, file] of fileArray.entries()) {
        const fileId = `${Date.now()}-${index}`;
        setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

        // Get upload URL
        const uploadUrl = await generateUploadUrl(writeAccess);

        // Upload file with progress tracking
        const xhr = new XMLHttpRequest();
        await new Promise<void>((resolve, reject) => {
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              setUploadProgress((prev) => ({ ...prev, [fileId]: percent }));
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status === 200) {
              resolve();
            } else {
              reject(new Error(`Upload failed: ${xhr.statusText}`));
            }
          });

          xhr.addEventListener("error", () => reject(new Error("Upload error")));
          xhr.open("POST", uploadUrl);
          xhr.send(file);
        });

        // Get storage ID from response
        const result = JSON.parse(xhr.response);
        const storageId = result.storageId as Id<"_storage">;

        // Attach to bake
        await attachPhoto({
          ...writeAccess,
          bakeId,
          storageId,
          alt: file.name.replace(/\.\w+$/, ""),
        });

        setUploadProgress((prev) => {
          const next = { ...prev };
          delete next[fileId];
          return next;
        });
      }

      onPhotosChange?.();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async (photoId: Id<"photos">) => {
    if (!confirm("Remove this photo?")) return;

    try {
      await removePhoto({ ...writeAccess, photoId });
      onPhotosChange?.();
    } catch (error) {
      console.error("Remove failed:", error);
      alert("Failed to remove photo");
    }
  };

  const handleSetCover = async (photoId: Id<"photos">) => {
    try {
      await setCover({ ...writeAccess, photoId });
      onPhotosChange?.();
    } catch (error) {
      console.error("Set cover failed:", error);
      alert("Failed to set cover");
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newOrder = [...photos];
    const current = newOrder[index];
    const previous = newOrder[index - 1];
    if (!current || !previous) return;
    
    newOrder[index - 1] = current;
    newOrder[index] = previous;

    try {
      await reorderPhotos({
        ...writeAccess,
        bakeId,
        photoIds: newOrder.map((p) => p._id),
      });
      onPhotosChange?.();
    } catch (error) {
      console.error("Reorder failed:", error);
      alert("Failed to reorder photos");
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === photos.length - 1) return;
    const newOrder = [...photos];
    const current = newOrder[index];
    const next = newOrder[index + 1];
    if (!current || !next) return;
    
    newOrder[index] = next;
    newOrder[index + 1] = current;

    try {
      await reorderPhotos({
        ...writeAccess,
        bakeId,
        photoIds: newOrder.map((p) => p._id),
      });
      onPhotosChange?.();
    } catch (error) {
      console.error("Reorder failed:", error);
      alert("Failed to reorder photos");
    }
  };

  const uploadingFiles = Object.keys(uploadProgress);
  const hasUploads = uploadingFiles.length > 0;

  return (
    <div className="photo-manager">
      <div className="photo-manager-header">
        <h3 className="text-base font-medium">Recipe Photos</h3>
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="btn-secondary btn-sm"
        >
          {uploading ? "Uploading..." : "Add Photos"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={uploading}
        />
      </div>

      {hasUploads && (
        <div className="photo-manager-progress">
          {uploadingFiles.map((fileId) => (
            <div key={fileId} className="upload-progress">
              <div className="upload-progress-bar">
                <div
                  className="upload-progress-fill"
                  style={{ width: `${uploadProgress[fileId]}%` }}
                />
              </div>
              <span className="text-xs text-ink-soft">
                {uploadProgress[fileId]}%
              </span>
            </div>
          ))}
        </div>
      )}

      {photos.length === 0 && !hasUploads && (
        <p className="text-sm text-ink-soft mt-2">
          No photos yet. Add some to show on the recipe page.
        </p>
      )}

      {photos.length > 0 && (
        <div className="photo-manager-list">
          {photos.map((photo, index) => {
            const isCover = photo.storageId === coverStorageId;
            return (
              <div key={photo._id} className="photo-manager-item">
                <div className="photo-manager-thumb">
                  {photo.url && (
                    <img
                      src={photo.url}
                      alt={photo.alt}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {isCover && (
                    <span className="photo-manager-badge">Cover</span>
                  )}
                </div>

                <div className="photo-manager-actions">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="btn-icon btn-sm"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === photos.length - 1}
                      className="btn-icon btn-sm"
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>

                  {!isCover && (
                    <button
                      type="button"
                      onClick={() => handleSetCover(photo._id)}
                      className="btn-secondary btn-sm"
                    >
                      Set as cover
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemove(photo._id)}
                    className="btn-secondary btn-sm text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .photo-manager {
          border: 1px solid var(--color-line);
          border-radius: 0.5rem;
          padding: 1rem;
          margin-top: 1rem;
        }

        .photo-manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .photo-manager-progress {
          margin-bottom: 1rem;
        }

        .upload-progress {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .upload-progress-bar {
          flex: 1;
          height: 0.5rem;
          background: var(--color-line);
          border-radius: 0.25rem;
          overflow: hidden;
        }

        .upload-progress-fill {
          height: 100%;
          background: var(--color-teal);
          transition: width 0.3s ease;
        }

        .photo-manager-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .photo-manager-item {
          display: flex;
          gap: 1rem;
          padding: 0.75rem;
          border: 1px solid var(--color-line);
          border-radius: 0.375rem;
          background: var(--color-paper-soft);
        }

        .photo-manager-thumb {
          position: relative;
          width: 80px;
          height: 80px;
          flex-shrink: 0;
          border-radius: 0.25rem;
          overflow: hidden;
          background: var(--color-line);
        }

        .photo-manager-badge {
          position: absolute;
          top: 0.25rem;
          left: 0.25rem;
          padding: 0.125rem 0.375rem;
          background: var(--color-teal);
          color: white;
          font-size: 0.65rem;
          font-weight: 600;
          border-radius: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .photo-manager-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
        }

        .btn-icon {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
          border: 1px solid var(--color-line);
          background: white;
          border-radius: 0.25rem;
          cursor: pointer;
        }

        .btn-icon:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-icon:hover:not(:disabled) {
          background: var(--color-paper-soft);
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
        }

        .btn-secondary {
          border: 1px solid var(--color-line);
          background: white;
          border-radius: 0.25rem;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-secondary:hover {
          background: var(--color-paper-soft);
        }

        .hidden {
          display: none;
        }
      `}</style>
    </div>
  );
}
