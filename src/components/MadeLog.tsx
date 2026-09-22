import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Link } from "react-router";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { RecipeEdit } from "@/components/RecipeEdit";
import { formatBakeDate } from "@/lib/dates";
import { useToast } from "@/lib/toast";

export function MadeLog() {
  const rows = useQuery(api.bakes.listPosted);
  const removeMine = useMutation(api.bakes.removeMine);
  const [removingId, setRemovingId] = useState<Id<"bakes"> | null>(null);
  const toast = useToast();

  async function remove(bakeId: Id<"bakes">, title: string) {
    if (removingId) {
      return;
    }
    const ok = window.confirm(
      `Delete “${title}” from the book? This can’t be undone.`,
    );
    if (!ok) {
      return;
    }
    setRemovingId(bakeId);
    try {
      await removeMine({ bakeId });
      toast.success("Recipe removed from the book.");
    } catch (caught) {
      toast.error(
        caught instanceof Error
          ? caught.message
          : "Couldn’t delete that recipe.",
      );
    } finally {
      setRemovingId(null);
    }
  }

  if (rows === undefined) {
    return (
      <section className="made-log" aria-labelledby="made-log-heading">
        <h2
          id="made-log-heading"
          className="font-display text-[1.65rem] leading-8"
        >
          What you&apos;ve made
        </h2>
        <p role="status" className="mt-3 text-[18px] leading-7 text-ink-soft">
          Opening your list…
        </p>
      </section>
    );
  }

  return (
    <section className="made-log" aria-labelledby="made-log-heading">
      <h2
        id="made-log-heading"
        className="font-display text-[1.65rem] leading-8"
      >
        What you&apos;ve made
      </h2>

      {rows.length === 0 ? (
        <p className="mt-3 text-[18px] leading-7 text-ink-soft">Nothing yet.</p>
      ) : (
        <ol className="made-log-list">
          {rows.map((row) => (
            <li key={row._id} className="made-log-item">
              <div className="made-log-row">
                <div className="min-w-0 flex-1">
                  <time
                    className="text-[16px] leading-6 text-ink-soft"
                    dateTime={row.bakedOn}
                  >
                    {formatBakeDate(row.bakedOn)}
                  </time>
                  <p className="font-display mt-1 text-[1.35rem] leading-8 tracking-tight">
                    <Link
                      to={`/bakes/${row.slug}`}
                      className="made-log-title inline-flex min-h-12 items-center"
                    >
                      {row.title}
                    </Link>
                  </p>
                  {row.outcome ? (
                    <p className="mt-1 text-[18px] leading-7 text-ink-soft italic">
                      {row.outcome}
                    </p>
                  ) : null}
                </div>
                <div className="made-log-actions">
                  <RecipeEdit
                    bakeId={row._id}
                    title={row.title}
                    ownerId={row.ownerId}
                    className="made-log-edit"
                  />
                  <button
                    type="button"
                    className="book-press book-press-text made-log-delete"
                    disabled={removingId === row._id}
                    aria-busy={removingId === row._id}
                    aria-label={`Delete ${row.title}`}
                    onClick={() => void remove(row._id, row.title)}
                  >
                    {removingId === row._id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

    </section>
  );
}
