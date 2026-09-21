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
  const section = sectionOf(pathname);
  const onDoor = family.status !== "in";

  // Door bookmarks reserve the same top shelf as the signed-in tabs,
  // so the book doesn't jump when someone comes in from Google.
  if (onDoor) {
    return (
      <nav className="book-bookmarks" aria-label="Book sections">
        <NavLink
          to="/join"
          end
          aria-current={section === "join" ? "page" : undefined}
          className={() => bookmarkClass(section === "join")}
        >
          Join
        </NavLink>
        <NavLink
          to="/faq"
          aria-current={section === "faq" ? "page" : undefined}
          className={() => bookmarkClass(section === "faq")}
        >
          FAQ
        </NavLink>
      </nav>
    );
  }

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
