import { DESK_PATH } from "@/lib/desk";
import { sectionOf } from "@/lib/bookPages";
import { useFamily } from "@/lib/family";
import { usePeekCalled, usePreview } from "@/lib/preview";

export type BookNavItem = {
  id: "cookbook" | "add" | "you";
  to: string;
  label: string;
  shortLabel: string;
  ariaLabel?: string;
  active: boolean;
  end?: boolean;
  disabled?: boolean;
};

export function useBookNav(pathname: string): {
  onDoor: boolean;
  items: BookNavItem[];
} {
  const family = useFamily();
  const { asKey, keep } = usePreview();
  const peekCalled = usePeekCalled();
  const section = sectionOf(pathname);
  const onDoor = family.status !== "in";

  if (onDoor) {
    return { onDoor: true, items: [] };
  }

  const settingsActive = section === "you" || section === "family";
  const called = peekCalled ?? family.user?.called ?? "You";
  const settingsTo = asKey ? pathname : "/you";

  const items: BookNavItem[] = [
    {
      id: "cookbook",
      to: keep("/"),
      label: "Recipes",
      shortLabel: "Recipes",
      active: section === "cookbook",
      end: true,
    },
    {
      id: "add",
      to: keep(DESK_PATH),
      label: "Add a recipe",
      shortLabel: "Add",
      ariaLabel: "Add a recipe",
      active: section === "add",
    },
    {
      id: "you",
      to: keep(settingsTo),
      label: called,
      shortLabel: called,
      ariaLabel: `${called}, settings`,
      active: settingsActive,
      disabled: Boolean(asKey),
    },
  ];

  return { onDoor: false, items };
}
