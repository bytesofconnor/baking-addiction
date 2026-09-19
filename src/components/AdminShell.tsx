import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useFamily } from "@/lib/family";
import { usePreview, type DummyKey } from "@/lib/preview";
import { useSeasonControl } from "@/lib/SeasonTheme";
import {
  MONTH_LONG,
  MONTH_SHORT,
  type MonthNumber,
} from "@/lib/season";

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as MonthNumber[];

export function AdminShell() {
  const { status } = useFamily();
  const { asKey, setAs, open, setOpen } = usePreview();
  const { month, forced, setMonth } = useSeasonControl();
  const dummyCooks = useQuery(
    api.preview.dummyCooks,
    status === "in" ? {} : "skip",
  );
  const cooks = dummyCooks ?? [];
  const viewing =
    asKey && cooks.find((cook) => cook.key === asKey)?.called;

  if (!open) {
    return (
      <div className="admin-shell admin-shell-collapsed">
        <button
          type="button"
          className="admin-tab"
          onClick={() => setOpen(true)}
        >
          Preview
          <span className="admin-tab-meta">
            {MONTH_SHORT[month - 1]}
            {viewing ? ` · ${viewing}` : ""}
          </span>
        </button>
      </div>
    );
  }

  return (
    <aside className="admin-shell" aria-label="Preview controls">
      <div className="admin-shell-head">
        <p className="admin-kicker">Preview</p>
        <button
          type="button"
          className="admin-text-btn"
          onClick={() => setOpen(false)}
        >
          Hide
        </button>
      </div>
      <p className="admin-lede">
        Try a month. Open someone else&apos;s book. This bar isn&apos;t in
        the real thing.
      </p>

      <section className="admin-block">
        <h2 className="admin-label">Month</h2>
        <div className="admin-pills">
          <AdminPill
            pressed={!forced}
            onClick={() => setMonth(null)}
          >
            Now
          </AdminPill>
          {MONTHS.map((value) => (
            <AdminPill
              key={value}
              pressed={forced && month === value}
              onClick={() => setMonth(value)}
              title={MONTH_LONG[value - 1]}
            >
              {MONTH_SHORT[value - 1]}
            </AdminPill>
          ))}
        </div>
        <p className="admin-note">
          {forced
            ? `${MONTH_LONG[month - 1]} on the table`
            : `${MONTH_LONG[month - 1]} — Minnesota now`}
        </p>
      </section>

      <section className="admin-block">
        <h2 className="admin-label">Open as</h2>
        {status !== "in" ? (
          <p className="admin-note">Sign in first.</p>
        ) : cooks.length === 0 ? (
          <p className="admin-note">
            No sample cooks yet. Family → Put some family in.
          </p>
        ) : (
          <>
            <div className="admin-pills">
              <AdminPill pressed={!asKey} onClick={() => setAs(null)}>
                Me
              </AdminPill>
              {cooks.map((cook) => (
                <AdminPill
                  key={cook.key}
                  pressed={asKey === cook.key}
                  onClick={() => setAs(cook.key as DummyKey)}
                >
                  {cook.called}
                </AdminPill>
              ))}
            </div>
            <p className="admin-note">
              {asKey
                ? `The pages read as ${viewing ?? "theirs"}.`
                : "Your pages."}
            </p>
          </>
        )}
      </section>
    </aside>
  );
}

function AdminPill({
  pressed,
  onClick,
  title,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  title?: string;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      title={title}
      onClick={onClick}
      className={pressed ? "admin-pill is-on" : "admin-pill"}
    >
      {children}
    </button>
  );
}
