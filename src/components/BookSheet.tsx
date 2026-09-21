import type { Ref } from "react";
import { useLocation } from "react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { WarmPages } from "@/components/WarmPages";
import { BookHeadingProvider } from "@/lib/bookHeading";
import { pageForPath } from "@/lib/bookPages";
import { SITE_SHORT } from "@/lib/site";

export function BookChrome({ pathname }: { pathname?: string }) {
  const location = useLocation();
  const path = pathname ?? location.pathname;

  return (
    <div className="book-chrome">
      <a
        href="#main"
        className="skip-link"
        onClick={() => {
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

export function BookColophon({ pathname }: { pathname: string }) {
  const page = pageForPath(pathname);
  const showPageNumber = pathname !== "/join" && pathname !== "/";

  return (
    <footer className="book-colophon">
      <p className="flex items-baseline justify-between gap-4 text-[16px] leading-6">
        <span className="font-display text-[1.35rem] leading-6 text-cinnamon-deep italic">
          {SITE_SHORT}
        </span>
        {showPageNumber && (
          <span className="font-display text-[1.05rem] leading-6 text-cocoa tabular-nums">
            {page}
          </span>
        )}
      </p>
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
