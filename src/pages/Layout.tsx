import { useEffect, useRef, type CSSProperties } from "react";
import { AdminShell } from "@/components/AdminShell";
import { BookBinding } from "@/components/BookBinding";
import { BookBookmarks } from "@/components/BookBookmarks";
import { BookCover } from "@/components/BookCover";
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
  const { pathname, flip, ghost } = useBookFlip(liveFace);
  const page = pageForPath(pathname);
  const leafTurning =
    flip !== null && flip.kind === "page" && ghost !== null;
  const bookTurning = flip !== null && flip.kind === "book";
  const landingCover = pathname === "/join" && family.status !== "in";
  const backFace = pathname === "/faq" && family.status !== "in";

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
    <div
      className="room-shell"
      data-preview={preview ? (open ? "open" : "shut") : undefined}
      data-bookmarks="true"
      data-landing-cover={landingCover ? "true" : undefined}
    >
      {preview ? <AdminShell /> : null}
      <SeasonDoodles />
      <div
        className="book relative z-10 mx-auto w-full max-w-[44rem] md:max-w-[52rem] xl:max-w-[66rem] 2xl:max-w-[72rem]"
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
        >
          <div className="book-leaf book-leaf-under">
            <BookFace pathname={pathname} faceRef={liveFace} />
          </div>
          {leafTurning ? (
            <div className="book-leaf book-leaf-over">
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
  );
}
