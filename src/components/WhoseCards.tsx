import type { MixPerson, MixSelection } from "@/lib/cookbookMix";
import { collapsePeople, sameMix } from "@/lib/cookbookMix";
import { BakerAvatar } from "@/components/BakerAvatar";
import { FilterSegment, FilterSegments } from "@/components/BookFilters";

export function WhoseCards({
  people,
  selection,
  onChange,
  selfAvatarUrl,
}: {
  people: MixPerson[];
  selection: MixSelection;
  onChange: (next: MixSelection) => void;
  selfAvatarUrl?: string | null;
}) {
  const unique = collapsePeople(people);
  const everyone: MixSelection = {
    includeMine: true,
    otherUserIds: unique.map((person) => person.otherUserId),
  };
  const justMe: MixSelection = { includeMine: true, otherUserIds: [] };

  const lenses: Array<{
    key: string;
    label: string;
    avatarUrl?: string | null;
    selected: boolean;
    open: () => void;
  }> = [
    {
      key: "all",
      label: "All",
      selected: sameMix(selection, everyone),
      open: () => onChange(everyone),
    },
    {
      key: "me",
      label: "Me",
      avatarUrl: selfAvatarUrl,
      selected: sameMix(selection, justMe),
      open: () => onChange(justMe),
    },
    ...unique.map((person) => {
      const alone: MixSelection = {
        includeMine: false,
        otherUserIds: [person.otherUserId],
      };
      return {
        key: person.otherUserId,
        label: person.called,
        avatarUrl: person.avatarUrl,
        selected: sameMix(selection, alone),
        open: () => onChange(alone),
      };
    }),
  ];

  // Older URLs may still carry a custom mix; fall back to All visually.
  const anySelected = lenses.some((lens) => lens.selected);

  return (
    <div className="book-whose">
      <FilterSegments labelledBy="whose-mix-label">
        <p id="whose-mix-label" className="sr-only">
          Whose recipes
        </p>
        {lenses.map((lens) => (
          <FilterSegment
            key={lens.key}
            checked={lens.selected || (!anySelected && lens.key === "all")}
            onChange={lens.open}
          >
            {lens.key !== "all" ? (
              <span className="book-mark-who">
                <BakerAvatar
                  name={lens.label}
                  url={lens.avatarUrl}
                  size="sm"
                />
                <span className="book-mark-label">{lens.label}</span>
              </span>
            ) : (
              <span className="book-mark-label">{lens.label}</span>
            )}
          </FilterSegment>
        ))}
      </FilterSegments>
    </div>
  );
}
