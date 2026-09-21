import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CookbookExplorer } from "@/components/CookbookExplorer";
import { RedirectToJoin } from "@/components/RedirectToJoin";
import { WhoseCards } from "@/components/WhoseCards";
import { PageTitle } from "@/lib/pageTitle";
import { SITE_NAME } from "@/lib/site";
import { useFamily } from "@/lib/family";
import { mixName, type MixPerson, type MixSelection } from "@/lib/cookbookMix";
import { useCookbookView } from "@/lib/preview";

function trayNote(
  selection: MixSelection | undefined,
  people: MixPerson[],
): string {
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
  const { status, kitchenId, user } = useFamily();
  const view = useCookbookView();
  const saveMix = useMutation(api.mixes.save);
  const [remembering, setRemembering] = useState(false);
  const hasFamily = view.people.length > 0;

  async function remember() {
    if (!view.selection || !user || view.peeking) {
      return;
    }
    setRemembering(true);
    try {
      const name = mixName(
        view.selection.includeMine,
        view.people.filter((person) =>
          view.selection?.otherUserIds.includes(person.otherUserId),
        ),
        user.called,
      );
      await saveMix({
        name: name === "Just me" ? "Just me" : name,
        includeMine: view.selection.includeMine,
        otherUserIds: view.selection.otherUserIds,
        makeDefault: true,
      });
    } finally {
      setRemembering(false);
    }
  }

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
      mixes={view.mixes}
      selection={view.selection}
      onChange={view.applyMix}
      onRemember={() => void remember()}
      remembering={remembering}
      canRemember={!view.peeking}
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
        emptyNote={trayNote(view.selection ?? undefined, view.people)}
      />
    </>
  );
}
