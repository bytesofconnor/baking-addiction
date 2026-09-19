import { type ReactNode } from "react";
import { useOutlet } from "react-router";
import { HomePage } from "@/pages/HomePage";
import { WritePage } from "@/pages/WritePage";
import { YouPage } from "@/pages/YouPage";
import { PageActiveContext } from "@/lib/pageActive";
import { useFamily } from "@/lib/family";
import { sectionOf } from "@/lib/bookPages";

function WarmPage({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <PageActiveContext.Provider value={show}>
      <div hidden={!show} inert={!show} className={show ? "contents" : undefined}>
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
    onBake || section === "family" || section === "join" || section === "other";

  return (
    <>
      <WarmPage show={section === "cookbook" && !onBake}>
        <HomePage />
      </WarmPage>
      <WarmPage show={section === "add"}>
        <WritePage />
      </WarmPage>
      <WarmPage show={section === "you"}>
        <YouPage />
      </WarmPage>
      {extra ? (
        <div key={pathname} className="book-page-arrive">
          {outlet}
        </div>
      ) : null}
    </>
  );
}
