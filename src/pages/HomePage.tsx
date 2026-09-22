import { CookbookExplorer } from "@/components/CookbookExplorer";
import { RedirectToJoin } from "@/components/RedirectToJoin";
import { WhoseCards } from "@/components/WhoseCards";
import { PageTitle } from "@/lib/pageTitle";
import { SITE_NAME } from "@/lib/site";
import { useFamily } from "@/lib/family";
import { type MixPerson, type MixSelection } from "@/lib/cookbookMix";
import { useCookbookView } from "@/lib/preview";

function trayNote(
  selection: MixSelection | undefined,
  people: MixPerson[],
  emptyBook: boolean,
): string {
  if (emptyBook) {
    return "Welcome in. Start adding your favorites to your book, and then you can share them.";
  }
  if (!selection) {
    return "Hmm. This tray is empty.";
  }
  const others = people.filter((person) =>
    selection.otherUserIds.includes(person.otherUserId),
  );
  if (selection.includeMine && others.length === 0) {
    return "Hmm. Yours aren’t in yet.";
  }
  if (!selection.includeMine && others.length === 0) {
    return "Hmm. Nobody’s on this page.";
  }
  if (!selection.includeMine && others.length === 1) {
    const who = others[0]?.called;
    return who
      ? `Hmm. Nothing from ${who} yet.`
      : "Hmm. This tray is empty.";
  }
  return "Hmm. This tray is empty.";
}

export function HomePage() {
  const { status, kitchenId } = useFamily();
  const view = useCookbookView();
  const hasFamily = view.people.length > 0;

  if (status === "checking") {
    return (
      <>
        <PageTitle title={SITE_NAME} />
        <p role="status">Opening the recipe book…</p>
      </>
    );
  }

  if (status === "out") {
    return <RedirectToJoin />;
  }

  if (!kitchenId || !view.ready || view.bakes === undefined) {
    return (
      <>
        <PageTitle title={SITE_NAME} />
        <p role="status">Opening the recipe book…</p>
      </>
    );
  }

  const whose = hasFamily && view.selection ? (
    <WhoseCards
      people={view.people}
      selection={view.selection}
      onChange={view.applyMix}
      selfAvatarUrl={view.selfAvatarUrl}
    />
  ) : null;

  return (
    <>
      <PageTitle title={SITE_NAME} />
      <CookbookExplorer
        bakes={view.bakes}
        refreshing={view.bakesRefreshing}
        hasFamily={hasFamily}
        people={view.people}
        selfId={view.selfId}
        selfCalled={view.selfCalled}
        whose={whose}
        emptyNote={trayNote(
          view.selection ?? undefined,
          view.people,
          view.bakes.length === 0,
        )}
      />
    </>
  );
}
