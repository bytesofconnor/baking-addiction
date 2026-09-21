import { useLocation } from "react-router";
import { JoinCoverLanding } from "@/components/FamilyDoor";
import { useArrive } from "@/lib/arrive";
import { SITE_SHORT } from "@/lib/site";

export function BookCover() {
  const { phase } = useArrive();
  const { search } = useLocation();

  if (phase === "in") {
    return null;
  }

  const params = new URLSearchParams(search);
  const invited = Boolean(params.get("invite"));

  return (
    <section
      className="book-cover book-cover-landing"
      data-opening={phase === "opening" ? "true" : undefined}
      aria-label={`${SITE_SHORT}, the perfect family recipe book`}
    >
      <span className="book-cover-leaf">
        <span className="book-cover-front book-cover-front-landing">
          <picture className="book-cover-art-picture" aria-hidden="true">
            <source
              media="(max-width: 639px)"
              srcSet="/themes/recipe-book-cover-mobile.webp"
            />
            <img
              className="book-cover-art"
              src="/themes/recipe-book-cover.webp"
              alt=""
            />
          </picture>
          <JoinCoverLanding invited={invited} />
        </span>
        <span className="book-cover-back" aria-hidden="true" />
      </span>
    </section>
  );
}
