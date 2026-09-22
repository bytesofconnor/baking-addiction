import type { Ref } from "react";
import { useLocation } from "react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { WarmPages } from "@/components/WarmPages";
import { BookHeadingProvider } from "@/lib/bookHeading";
import { pageForPath, sectionOf } from "@/lib/bookPages";
import { SITE_LINE, SITE_SHORT } from "@/lib/site";

export function BookChrome({ pathname }: { pathname?: string }) {
  const location = useLocation();
  const path = pathname ?? location.pathname;

  return (
    <div className="book-chrome">
      <a
        href="#main"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        Skip to the recipe book
      </a>
      <SiteHeader
        pathname={path}
      />
    </div>
  );
}

function colophonAside(pathname: string): string | null {
  const section = sectionOf(pathname);
  if (section === "cookbook") {
    if (pathname.startsWith("/bakes/")) {
      return null;
    }
    return "Recipes from this kitchen";
  }
  if (section === "add") {
    return "Writing into the book";
  }
  if (section === "you") {
    return "Your kitchen";
  }
  if (section === "family") {
    return "Family in the book";
  }
  if (section === "faq") {
    return "A few answers";
  }
  if (section === "join") {
    return "Come in";
  }
  return SITE_LINE;
}

export function BookColophon({ pathname }: { pathname: string }) {
  const page = pageForPath(pathname);
  const aside = colophonAside(pathname);
  // Always reserve the page-number slot so tab flips don't nudge chrome height.
  const showPageNumber =
    pathname !== "/join" && pathname !== "/faq";

  return (
    <footer className="book-colophon">
      <div className="book-colophon-brand">
        <img
          src="/favicon.svg"
          alt=""
          width={22}
          height={22}
          className="book-colophon-mark"
          decoding="async"
        />
        <div className="book-colophon-copy">
          <p className="book-colophon-title">{SITE_SHORT}</p>
          {aside ? <p className="book-colophon-aside">{aside}</p> : null}
        </div>
      </div>
      {showPageNumber ? (
        <p className="book-colophon-page" aria-hidden="true">
          <span className="book-colophon-page-rule" />
          <span className="book-colophon-page-num">{page}</span>
          <span className="book-colophon-page-rule" />
        </p>
      ) : (
        <p className="book-colophon-page book-colophon-page-quiet" aria-hidden="true">
          <span className="book-colophon-page-rule" />
          <span className="book-colophon-page-dot" />
          <span className="book-colophon-page-rule" />
        </p>
      )}
    </footer>
  );
}

export function BookFace({
  pathname,
  faceRef,
}: {
  pathname: string;
  faceRef?: Ref<HTMLDivElement>;
}) {
  return (
    <BookHeadingProvider>
      <div className="book-face" ref={faceRef}>
        <BookChrome pathname={pathname} />
        <div className="book-sheet-inner">
          <main id="main" className="book-page-body" tabIndex={-1}>
            <WarmPages pathname={pathname} />
          </main>
        </div>
        <BookColophon pathname={pathname} />
      </div>
    </BookHeadingProvider>
  );
}
