import { WhiskMark } from "@/components/WhiskMark";
import { useArrive } from "@/lib/arrive";
import { SITE_LINE, SITE_SHORT } from "@/lib/site";

export function BookCover() {
  const { phase, skip } = useArrive();

  if (phase === "in") {
    return null;
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
              <WhiskMark className="h-6 w-6" />
            </span>
            <span className="book-cover-mark">
              That&apos;s{" "}
              <span className="book-cover-yum">Yum</span>
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
