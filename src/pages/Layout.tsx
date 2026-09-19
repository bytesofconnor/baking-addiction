import { useEffect, useRef } from "react";
import { AdminShell } from "@/components/AdminShell";
import { BookBinding } from "@/components/BookBinding";
import { BookCover } from "@/components/BookCover";
import { BookFace } from "@/components/BookSheet";
import { SeasonDoodles } from "@/components/SeasonDoodles";
import { pageForPath } from "@/lib/bookPages";
import { usePreview } from "@/lib/preview";
import { useBookFlip } from "@/lib/useBookFlip";

export function Layout() {
  const { open } = usePreview();
  const liveFace = useRef<HTMLDivElement>(null);
  const { pathname, flip, ghost } = useBookFlip(liveFace);
  const page = pageForPath(pathname);
  const turning = flip !== null && ghost !== null;

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
    <div className="room-shell" data-preview={open ? "open" : "shut"}>
      <AdminShell />
      <SeasonDoodles />
      <div
        className="book relative z-10 mx-auto w-full max-w-[44rem] md:max-w-[52rem] xl:max-w-[58rem]"
        data-page={page}
        aria-busy={turning ? true : undefined}
      >
        <div className="book-foredge book-foredge-back" aria-hidden="true" />
        <div className="book-footedge book-footedge-back" aria-hidden="true" />
        <div className="book-foredge" aria-hidden="true" />
        <div className="book-footedge" aria-hidden="true" />
        <BookCover />
        <div className="book-pages" data-dir={flip?.direction}>
          <div className="book-leaf book-leaf-under">
            <BookFace pathname={pathname} faceRef={liveFace} />
          </div>
          {turning ? (
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
