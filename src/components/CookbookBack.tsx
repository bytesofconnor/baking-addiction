import { useNavigate } from "react-router";
import { usePreview } from "@/lib/preview";
import { cn } from "@/lib/utils";

export function CookbookBack({ className }: { className?: string }) {
  const navigate = useNavigate();
  const { keep } = usePreview();

  return (
    <button
      type="button"
      className={cn("book-press book-press-back", className)}
      aria-label="Back to the book"
      onClick={() => {
        const idx = window.history.state?.idx;
        if (typeof idx === "number" && idx > 0) {
          navigate(-1);
          return;
        }
        navigate(keep("/"));
      }}
    >
      <svg className="book-press-mark" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M14.2 5.2 8 12l6.2 6.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="book-press-back-full">Back to the book</span>
      <span className="book-press-back-short" aria-hidden="true">
        Back
      </span>
    </button>
  );
}
