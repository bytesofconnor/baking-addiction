import type { Ref } from "react";
import { useLocation } from "react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { WarmPages } from "@/components/WarmPages";
import { BookHeadingProvider } from "@/lib/bookHeading";
import { pageForPath } from "@/lib/bookPages";
import { useFamily } from "@/lib/family";
import { usePeekCalled, usePreview } from "@/lib/preview";
import { bookSignedName, SITE_LINE } from "@/lib/site";

export function BookChrome({ pathname }: { pathname?: string }) {
  const family = useFamily();
  const location = useLocation();
  const path = pathname ?? location.pathname;
  const { asKey } = usePreview();
  const peek = usePeekCalled();
  const peeking = Boolean(asKey);
  const ownerCalled = peek ?? (peeking ? undefined : family.user?.called);
  const signed =
    family.status === "in" ? bookSignedName(ownerCalled) : undefined;

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
        showWrite={family.canWrite}
        showPeople={family.status === "in"}
        showSignIn={
          family.status === "out" && path !== "/" && path !== "/join"
        }
        signed={signed}
        signedTo={peeking ? undefined : "/you"}
        line={SITE_LINE}
        pathname={path}
      />
    </div>
  );
}

export function BookColophon({ pathname }: { pathname: string }) {
  const page = pageForPath(pathname);

  return (
    <footer className="book-colophon">
      <p className="flex items-baseline justify-between gap-4 text-[16px] leading-6">
        <span className="font-display text-[1.35rem] leading-6 text-cinnamon-deep italic">
          That&apos;s Yum
        </span>
        <span className="font-display text-[1.05rem] leading-6 text-cocoa tabular-nums">
          {page}
        </span>
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
