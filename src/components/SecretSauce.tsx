import { Kicker } from "@/components/Kicker";

export function SecretSauce({
  changes,
}: {
  changes: Array<{ move: string; change: string; why: string }>;
}) {
  if (changes.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="secret-sauce-heading"
      className="border border-rule border-l-[3px] border-l-cinnamon bg-paper-raised px-5 py-5"
    >
      <Kicker>The secret sauce</Kicker>
      <h2 id="secret-sauce-heading" className="font-display mt-1 text-[1.65rem] leading-8">
        What I changed
      </h2>
      <ol className="mt-4 flex flex-col">
        {changes.map((change) => (
          <li
            key={`${change.move}-${change.change}`}
            className="border-t border-rule/80 py-3 first:border-t-0 first:pt-0 last:pb-0"
          >
            <p className="text-[16px] leading-6 text-ink-soft">{change.move}</p>
            <p className="font-display text-[1.4rem] leading-8">{change.change}</p>
            {change.why ? (
              <p className="text-[18px] leading-7 text-ink-soft">{change.why}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
