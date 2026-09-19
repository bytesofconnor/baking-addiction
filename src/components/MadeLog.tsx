import { useQuery } from "convex/react";
import { Link } from "react-router";
import { api } from "../../convex/_generated/api";
import { BakeStars } from "@/components/BakeStars";
import { formatMadeAt } from "@/lib/dates";

export function MadeLog() {
  const rows = useQuery(api.makes.mine);

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
              <time
                className="text-[16px] leading-6 text-ink-soft"
                dateTime={new Date(row.madeAt).toISOString()}
              >
                {formatMadeAt(row.madeAt)}
              </time>
              <p className="font-display mt-1 text-[1.35rem] leading-8 tracking-tight">
                <Link
                  to={`/bakes/${row.slug}`}
                  className="made-log-title inline-flex min-h-12 items-center"
                >
                  {row.title}
                </Link>
              </p>
              <BakeStars value={row.rating} size="card" />
              {row.note ? (
                <p className="mt-1 text-[18px] leading-7 text-ink-soft italic">
                  {row.note}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
