import { Link } from "react-router";
import { Wordmark } from "@/components/Wordmark";
import { useBookHeading } from "@/lib/bookHeading";
import { usePreview } from "@/lib/preview";
import { pageHeading } from "@/lib/site";

export function SiteHeader({
  pathname = "/",
}: {
  pathname?: string;
}) {
  const bookHeading = useBookHeading();
  const { keep } = usePreview();
  const heading = pageHeading(pathname, bookHeading?.recipeTitle);
  const onYou = pathname === "/you" || pathname.startsWith("/you/");
  // Quiet mark on the main kitchen pages — not on recipe leaves / join / FAQ.
  const flourish =
    !heading.compact &&
    pathname !== "/join" &&
    pathname !== "/faq";

  const heart = (
    <img
      src="/favicon.svg"
      alt=""
      width={40}
      height={40}
      className="book-sign-heart"
      decoding="async"
    />
  );

  return (
    <header className="book-chrome-head">
      <div className="book-chrome-title">
        <Wordmark
          linked={heading.home}
          lead={heading.lead}
          accent={heading.accent}
          compact={heading.compact}
        />
      </div>
      {flourish ? (
        onYou ? (
          <span className="book-sign" aria-hidden="true">
            {heart}
          </span>
        ) : (
          <Link
            to={keep("/you")}
            className="book-sign"
            aria-label="Your kitchen"
          >
            {heart}
          </Link>
        )
      ) : null}
    </header>
  );
}
