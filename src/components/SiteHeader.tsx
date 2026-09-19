import { Link, NavLink } from "react-router";
import { Wordmark } from "@/components/Wordmark";
import { DESK_PATH } from "@/lib/desk";
import { usePreview } from "@/lib/preview";
import { useBookHeading } from "@/lib/bookHeading";
import { pageHeading, SITE_LINE } from "@/lib/site";

function navClass(isActive: boolean) {
  return [
    "font-display inline-flex min-h-14 cursor-pointer items-center px-2 py-2 text-[1.25rem] font-semibold touch-manipulation transition-all duration-150 rounded-md",
    isActive
      ? "bg-cinnamon-deep text-paper-raised shadow-md"
      : "text-ink hover:bg-paper-raised hover:text-cinnamon-deep hover:shadow-sm active:text-cocoa active:bg-paper-press",
  ].join(" ");
}

export function SiteHeader({
  showWrite,
  showPeople = false,
  showSignIn = false,
  signed,
  signedTo,
  line = SITE_LINE,
  pathname = "/",
}: {
  showWrite: boolean;
  showPeople?: boolean;
  showSignIn?: boolean;
  signed?: string;
  signedTo?: string;
  line?: string;
  pathname?: string;
}) {
  const { keep } = usePreview();
  const bookHeading = useBookHeading();
  const heading = pageHeading(pathname, bookHeading?.recipeTitle, signed);
  const hasNav = showPeople || showSignIn || showWrite;
  const onYou = pathname === "/you" || pathname.startsWith("/you/");
  const showSign = Boolean(signed) && !onYou;

  return (
    <header className={showSign ? "relative pr-[7.5rem]" : "relative"}>
      {showSign ? (
        signedTo ? (
          <Link
            to={keep(signedTo)}
            className="book-sign"
            aria-label={`${signed}, your page`}
          >
            {signed}
          </Link>
        ) : (
          <p className="book-sign">{signed}</p>
        )
      ) : null}
      <div>
        <Wordmark
          linked={heading.home}
          lead={heading.lead}
          accent={heading.accent}
          compact={heading.compact}
        />
      </div>
      {heading.compact || onYou ? null : (
        <p className="mt-1 max-w-[34rem] text-[17px] leading-6 text-ink-soft">
          {line}
        </p>
      )}
      {hasNav ? (
        <nav
          aria-label="Primary"
          className="mt-2 flex flex-wrap gap-x-4 gap-y-2 py-0.5"
        >
          {showPeople ? (
            <NavLink
              to={keep("/")}
              end
              className={({ isActive }) =>
                navClass(isActive || pathname.startsWith("/bakes/"))
              }
            >
              The recipe book
            </NavLink>
          ) : null}
          {showWrite ? (
            <NavLink
              to={DESK_PATH}
              className={({ isActive }) => navClass(isActive)}
            >
              Add a recipe
            </NavLink>
          ) : null}
          {showSignIn ? (
            <NavLink
              to={keep("/join")}
              className={({ isActive }) => navClass(isActive)}
            >
              Sign in
            </NavLink>
          ) : null}
        </nav>
      ) : null}
    </header>
  );
}
