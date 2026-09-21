import { NavLink } from "react-router";
import { DESK_PATH } from "@/lib/desk";
import { sectionOf } from "@/lib/bookPages";
import { useFamily } from "@/lib/family";
import { usePeekCalled, usePreview } from "@/lib/preview";

function bookmarkClass(active: boolean) {
  return `book-bookmark${active ? " book-bookmark-active" : ""}`;
}

export function BookBookmarks({ pathname }: { pathname: string }) {
  const family = useFamily();
  const { asKey, keep } = usePreview();
  const peekCalled = usePeekCalled();

  if (family.status !== "in") {
    return null;
  }

  const section = sectionOf(pathname);
  const settingsActive = section === "you" || section === "family";
  const called = peekCalled ?? family.user?.called ?? "You";
  const settingsTo = asKey ? pathname : "/you";

  return (
    <nav className="book-bookmarks" aria-label="Book sections">
      <NavLink
        to={keep("/")}
        end
        aria-current={section === "cookbook" ? "page" : undefined}
        className={() => bookmarkClass(section === "cookbook")}
      >
        Recipes
      </NavLink>
      <NavLink
        to={keep(DESK_PATH)}
        aria-current={section === "add" ? "page" : undefined}
        className={() => bookmarkClass(section === "add")}
      >
        <span className="hidden sm:inline">Add a recipe</span>
        <span className="sm:hidden">Add</span>
      </NavLink>
      <NavLink
        to={keep(settingsTo)}
        aria-label={`${called}, settings`}
        aria-current={settingsActive ? "page" : undefined}
        aria-disabled={asKey ? true : undefined}
        onClick={(event) => {
          if (asKey) {
            event.preventDefault();
          }
        }}
        className={() => bookmarkClass(settingsActive)}
      >
        {called}
      </NavLink>
    </nav>
  );
}
