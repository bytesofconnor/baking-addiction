import { useEffect, useRef, type CSSProperties } from "react";
import { AdminShell } from "@/components/AdminShell";
import { BookBinding } from "@/components/BookBinding";
import { BookBookmarks } from "@/components/BookBookmarks";
import { BookCover } from "@/components/BookCover";
import { BookDock } from "@/components/BookDock";
import { BookFace } from "@/components/BookSheet";
import { useArrive } from "@/lib/arrive";
import { SeasonDoodles } from "@/components/SeasonDoodles";
import { pageForPath } from "@/lib/bookPages";
import { useFamily } from "@/lib/family";
import { usePreview } from "@/lib/preview";
import { useBookFlip } from "@/lib/useBookFlip";

export function Layout() {
  const preview = import.meta.env.DEV;
  const family = useFamily();
  const { open } = usePreview();
  const { phase } = useArrive();
  const liveFace = useRef<HTMLDivElement>(null);
  const { pathname, flip, ghost, overlayHeightPx } = useBookFlip(liveFace);
  const page = pageForPath(pathname);
  const leafTurning =
    flip !== null && flip.kind === "page" && ghost !== null;
  const bookTurning = flip !== null && flip.kind === "book";
  const landingCover = pathname === "/join" && family.status !== "in";
  const backFace = pathname === "/faq" && family.status !== "in";
  const signedIn = family.status === "in";
  // Phones: bottom dock for Join/FAQ and the signed-in tabs (flush top).
  const useDock = signedIn || landingCover || backFace;
  // Signed-in pages grow with content so the window scrolls like a normal page.
  // Join / FAQ stay fixed to one viewport.
  const bookGrow =
    signedIn && !landingCover && !backFace && phase === "in";

  useEffect(() => {
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    return () => {
      robots.remove();
    };
  }, []);

  return (
    <>
      {/* Keep seasonal art on the viewport, outside the perspectived room.
          Otherwise the room's changing content height becomes the fixed
          layer's containing block and re-crops the illustration per page. */}
      <SeasonDoodles forceVisible={landingCover} />
      <div
        className="room-shell"
        data-preview={preview ? (open ? "open" : "shut") : undefined}
        data-bookmarks="true"
        data-dock={useDock ? "true" : undefined}
        data-landing-cover={landingCover ? "true" : undefined}
        data-book-grow={bookGrow ? "true" : undefined}
      >
        {preview ? <AdminShell /> : null}
        <div
          className="book relative z-10 mx-auto w-full max-w-[48rem] md:max-w-[64rem] xl:max-w-[84rem] 2xl:max-w-[96rem]"
          data-page={page}
          data-face={backFace ? "back" : undefined}
          data-spine={backFace ? "end" : undefined}
          data-book-flip={bookTurning ? flip.direction : undefined}
          style={
            bookTurning
              ? ({
                  "--book-over-duration": `${flip.durationMs}ms`,
                } as CSSProperties)
              : undefined
          }
          aria-busy={leafTurning || bookTurning ? true : undefined}
        >
          <BookBookmarks pathname={pathname} />
          <div className="book-foredge book-foredge-back" aria-hidden="true" />
          <div className="book-footedge book-footedge-back" aria-hidden="true" />
          <div className="book-foredge" aria-hidden="true" />
          <div className="book-footedge" aria-hidden="true" />
          <BookCover />
          {bookTurning && ghost ? (
            <div
              className="book-turn-face-ghost"
              aria-hidden="true"
              ref={(node) => {
                if (node && ghost.parentElement !== node) {
                  node.replaceChildren(ghost);
                }
              }}
            />
          ) : null}
          <div
            className="book-pages"
            data-dir={leafTurning ? flip?.direction : undefined}
            inert={!bookTurning && phase !== "in"}
            aria-hidden={!bookTurning && phase !== "in" ? true : undefined}
            style={
              leafTurning
                ? ({
                    // Keep room for the outgoing leaf without freezing the
                    // destination page to the old height (that snap-back is the
                    // post-flip “second paint”).
                    minHeight: overlayHeightPx ?? undefined,
                    overflow: "hidden",
                    "--book-flip-duration": `${flip.durationMs}ms`,
                  } as CSSProperties)
                : flip
                  ? ({
                      "--book-flip-duration": `${flip.durationMs}ms`,
                    } as CSSProperties)
                  : undefined
            }
          >
            <div className="book-leaf book-leaf-under">
              <BookFace pathname={pathname} faceRef={liveFace} />
            </div>
            {leafTurning ? (
              <div
                className="book-leaf book-leaf-over"
                style={
                  overlayHeightPx
                    ? { height: overlayHeightPx, bottom: "auto" }
                    : undefined
                }
              >
                <div className="book-leaf-front">
                  <div
                    className="book-flip-ghost"
                    ref={(node) => {
                      if (node && ghost.parentElement !== node) {
                        node.replaceChildren(ghost);
                      }
                    }}
                  />
                  <div className="book-leaf-shine" aria-hidden="true" />
                </div>
                <div className="book-leaf-back" aria-hidden="true" />
              </div>
            ) : null}
          </div>
          <BookBinding />
        </div>
      </div>
      {/* Outside the perspectived room so position:fixed sticks to the viewport. */}
      {useDock ? <BookDock pathname={pathname} /> : null}
    </>
  );
}
