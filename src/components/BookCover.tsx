import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { JoinCoverLanding } from "@/components/FamilyDoor";
import { useArrive } from "@/lib/arrive";
import { SITE_LINE, SITE_SHORT } from "@/lib/site";

export function BookCover() {
  const { phase, skip } = useArrive();
  const { pathname, search } = useLocation();
  const [landingVariant, setLandingVariant] = useState(pathname === "/join");

  useEffect(() => {
    if (phase === "arrive" && pathname === "/join") {
      setLandingVariant(true);
    } else if (phase === "in") {
      setLandingVariant(false);
    }
  }, [pathname, phase]);

  if (phase === "in") {
    return null;
  }

  if (landingVariant) {
    const params = new URLSearchParams(search);
    const invited = Boolean(params.get("invite") || params.get("code"));

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

  return (
    <button
      type="button"
      className="book-cover"
      data-opening={phase === "opening" ? "true" : undefined}
      onClick={skip}
      aria-label={`Open ${SITE_SHORT}`}
    >
      <span className="book-cover-leaf">
        <span className="book-cover-front">
          <span className="book-cover-plate">
            <span className="book-cover-kicker">
              Family recipes
            </span>
            <span className="book-cover-mark">
              The Family Recipe{" "}
              <span className="book-cover-yum">Book</span>
            </span>
            <span className="book-cover-line">
              {SITE_LINE.split(" ").map((word, index) => (
                <span key={`${word}-${index}`}>{word}</span>
              ))}
            </span>
          </span>
        </span>
        <span className="book-cover-back" aria-hidden="true" />
      </span>
    </button>
  );
}
