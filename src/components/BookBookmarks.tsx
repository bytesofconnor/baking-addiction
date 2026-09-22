import { NavLink } from "react-router";
import { sectionOf } from "@/lib/bookPages";
import { useBookNav } from "@/lib/bookNav";

function bookmarkClass(active: boolean) {
  return `book-bookmark${active ? " book-bookmark-active" : ""}`;
}

export function BookBookmarks({ pathname }: { pathname: string }) {
  const { onDoor, items } = useBookNav(pathname);
  const section = sectionOf(pathname);

  // Door bookmarks on tablet+: same top shelf as the signed-in tabs.
  // Phones hide these and use the bottom dock instead (see BookDock).
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

  return (
    <nav
      className="book-bookmarks book-bookmarks-signed-in"
      aria-label="Book sections"
    >
      {items.map((item) => (
        <NavLink
          key={item.id}
          to={item.to}
          end={item.end}
          aria-label={item.ariaLabel}
          aria-current={item.active ? "page" : undefined}
          aria-disabled={item.disabled ? true : undefined}
          onClick={(event) => {
            if (item.disabled) {
              event.preventDefault();
            }
          }}
          className={() => bookmarkClass(item.active)}
        >
          {item.id === "add" ? (
            <>
              <span className="hidden sm:inline" aria-hidden="true">
                {item.label}
              </span>
              <span className="sm:hidden" aria-hidden="true">
                {item.shortLabel}
              </span>
            </>
          ) : (
            item.label
          )}
        </NavLink>
      ))}
    </nav>
  );
}
