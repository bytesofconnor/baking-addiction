import type { MixPerson, MixSelection, SavedMix } from "@/lib/cookbookMix";
import { collapsePeople, sameMix } from "@/lib/cookbookMix";
import {
  FilterCheck,
  FilterChecks,
  FilterSegment,
  FilterSegments,
} from "@/components/BookFilters";

export function WhoseCards({
  people,
  mixes,
  selection,
  onChange,
  onRemember,
  remembering,
  canRemember = true,
}: {
  people: MixPerson[];
  mixes: SavedMix[];
  selection: MixSelection;
  onChange: (next: MixSelection) => void;
  onRemember: () => void;
  remembering?: boolean;
  canRemember?: boolean;
}) {
  const unique = collapsePeople(people);
  const selectedOthers = new Set(selection.otherUserIds);
  const usual = mixes.find((mix) => mix.isDefault);
  const matchesUsual =
    usual !== undefined &&
    sameMix(selection, {
      includeMine: usual.includeMine,
      otherUserIds: usual.otherUserIds,
    });
  const everyone: MixSelection = {
    includeMine: true,
    otherUserIds: unique.map((person) => person.otherUserId),
  };
  const justMe: MixSelection = { includeMine: true, otherUserIds: [] };
  const mixChoices = [
    {
      key: "everyone",
      label: "Whole family",
      selected: sameMix(selection, everyone),
      open: () => onChange(everyone),
    },
    {
      key: "just-me",
      label: "Just me",
      selected: sameMix(selection, justMe),
      open: () => onChange(justMe),
    },
  ];

  function toggleSelf() {
    onChange({
      includeMine: !selection.includeMine,
      otherUserIds: selection.otherUserIds,
    });
  }

  function togglePerson(id: MixPerson["otherUserId"]) {
    const next = selectedOthers.has(id)
      ? selection.otherUserIds.filter((other) => other !== id)
      : [...selection.otherUserIds, id];
    onChange({
      includeMine: selection.includeMine,
      otherUserIds: next,
    });
  }

  return (
    <div className="book-index">
      <FilterChecks labelledBy="whose-cards-label">
        <p id="whose-cards-label" className="sr-only">
          Who&apos;s in
        </p>
        <FilterCheck checked={selection.includeMine} onChange={toggleSelf}>
          Me
        </FilterCheck>
        {unique.map((person) => (
          <FilterCheck
            key={person.otherUserId}
            checked={selectedOthers.has(person.otherUserId)}
            onChange={() => togglePerson(person.otherUserId)}
          >
            {person.called}
          </FilterCheck>
        ))}
      </FilterChecks>
      <FilterSegments labelledBy="whose-mix-label">
        <p id="whose-mix-label" className="sr-only">
          The usual
        </p>
        {mixChoices.map((mix) => (
          <FilterSegment
            key={mix.key}
            checked={mix.selected}
            onChange={mix.open}
          >
            {mix.label}
          </FilterSegment>
        ))}
      </FilterSegments>
      {canRemember && !matchesUsual ? (
        <button
          type="button"
          className="book-filter-remember"
          disabled={remembering}
          onClick={onRemember}
        >
          {remembering ? "Saving…" : "Remember"}
        </button>
      ) : null}
    </div>
  );
}
