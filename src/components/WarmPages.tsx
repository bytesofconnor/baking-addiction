import { type ReactNode } from "react";
import { useOutlet } from "react-router";
import { HomePage } from "@/pages/HomePage";
import { WritePage } from "@/pages/WritePage";
import { YouPage } from "@/pages/YouPage";
import { FaqPage } from "@/pages/FaqPage";
import { PageActiveContext } from "@/lib/pageActive";
import { useFamily } from "@/lib/family";
import { sectionOf } from "@/lib/bookPages";

function WarmPage({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <PageActiveContext.Provider value={show}>
      <div
        className="book-warm-page"
        data-show={show ? "true" : "false"}
        inert={!show}
        aria-hidden={!show}
      >
        {children}
      </div>
    </PageActiveContext.Provider>
  );
}

export function WarmPages({ pathname }: { pathname: string }) {
  const outlet = useOutlet();
  const { status } = useFamily();
  const section = sectionOf(pathname);
  const onBake = pathname.startsWith("/bakes/");
  const signedIn = status === "in";

  // The whole-book transition intentionally holds its own pathname until the
  // midpoint. Render FAQ from that held pathname instead of the router outlet,
  // which has already advanced to /join and would leave the turning face empty.
  if (section === "faq") {
    return <FaqPage />;
  }

  if (!signedIn) {
    if (section === "add") {
      return <WritePage />;
    }
    if (section === "cookbook" && !onBake) {
      return <HomePage />;
    }
    return outlet;
  }

  const extra =
    onBake ||
    section === "family" ||
    section === "join" ||
    section === "other";

  return (
    <>
      {/*
        Keep the three tab roots mounted so their local state stays warm, while
        CSS removes inactive roots from layout. The active tab alone determines
        the book's natural height above the shared viewport-height floor.
      */}
      <div className="book-warm-stack" hidden={extra} aria-hidden={extra}>
        <WarmPage show={section === "cookbook" && !onBake}>
          <HomePage />
        </WarmPage>
        <WarmPage show={section === "add"}>
          <WritePage />
        </WarmPage>
        <WarmPage show={section === "you"}>
          <YouPage />
        </WarmPage>
      </div>
      {extra ? (
        <div key={pathname} className={onBake ? undefined : "book-page-arrive"}>
          {outlet}
        </div>
      ) : null}
    </>
  );
}
