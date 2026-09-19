const STARS = [1, 2, 3, 4, 5] as const;

function StarMark({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="bake-star-mark" aria-hidden="true">
      <path
        d="M12 3.2 14.4 8.8l6.1.5-4.7 3.9 1.5 5.9L12 16.7 6.7 19.1l1.5-5.9-4.7-3.9 6.1-.5Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BakeStars({
  value,
  onChange,
  labelledBy,
  size = "write",
}: {
  value: number;
  onChange?: (rating: number) => void;
  labelledBy?: string;
  size?: "write" | "card" | "try";
}) {
  const rating = Math.min(5, Math.max(0, Math.round(value)));
  const interactive = typeof onChange === "function";
  const sizeClass =
    size === "card" ? " bake-stars-card" : size === "try" ? " bake-stars-try" : "";

  if (!interactive) {
    if (rating < 1) {
      return null;
    }
    return (
      <p
        className={`bake-stars bake-stars-read${sizeClass}`}
        aria-label={`${rating} out of 5`}
      >
        {STARS.map((star) => (
          <span key={star} className="bake-star" data-on={star <= rating}>
            <StarMark filled={star <= rating} />
          </span>
        ))}
      </p>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-required="true"
      className={`bake-stars${sizeClass}`}
    >
      {STARS.map((star) => {
        const on = star <= rating;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={rating === star}
            aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
            className="bake-star-btn"
            data-on={on}
            onClick={() => onChange(star)}
          >
            <StarMark filled={on} />
          </button>
        );
      })}
    </div>
  );
}
