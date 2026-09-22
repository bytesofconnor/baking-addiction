import { NavLink } from "react-router";
import { useBookNav } from "@/lib/bookNav";

function dockClass(active: boolean) {
  return `book-dock-tab${active ? " book-dock-tab-active" : ""}`;
}

/** Fixed bottom dock for signed-in phones. Hidden from sm and up via CSS. */
export function BookDock({ pathname }: { pathname: string }) {
  const { onDoor, items } = useBookNav(pathname);

  if (onDoor || items.length === 0) {
    return null;
  }

  return (
    <nav className="book-dock" aria-label="Book sections">
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
          className={() => dockClass(item.active)}
        >
          {item.shortLabel}
        </NavLink>
      ))}
    </nav>
  );
}
