import { Kicker } from "@/components/Kicker";

export function KitchenMethod({
  makes,
  ingredients,
  steps,
  method,
  sourceTitle,
  sourceUrl,
  shared = false,
}: {
  makes?: string;
  ingredients?: string[];
  steps?: string[];
  method?: string;
  sourceTitle: string;
  sourceUrl: string;
  shared?: boolean;
}) {
  const whatWentIn = (ingredients ?? []).map((line) => line.trim()).filter(Boolean);
  const how = (steps ?? []).map((line) => line.trim()).filter(Boolean);
  const prose = method?.trim() ?? "";
  const hasLists = whatWentIn.length > 0 || how.length > 0;

  if (!hasLists && prose.length === 0) {
    return null;
  }

  const blocks = prose.split("\n\n").filter((block) => block.length > 0);

  return (
    <section
      aria-labelledby="kitchen-method-heading"
      className="border border-rule border-l-[3px] border-l-cinnamon bg-paper-raised px-5 py-6 md:px-7 md:py-7"
    >
      <Kicker>The recipe</Kicker>
      <h2
        id="kitchen-method-heading"
        className="font-display mt-1 text-[1.65rem] leading-8"
      >
        {shared ? "How to make it" : "How we made it"}
      </h2>
      {makes ? (
        <p className="mt-3 font-display text-[1.35rem] leading-8 text-cocoa">
          {makes}
        </p>
      ) : null}

      {hasLists ? (
        <div className="mt-5 grid gap-8 md:grid-cols-2 md:gap-10">
          {whatWentIn.length > 0 ? (
            <div>
              <h3 className="text-[16px] font-medium tracking-[0.04em] text-ink-soft uppercase">
                What went in
              </h3>
              <ul className="mt-3 flex flex-col">
                {whatWentIn.map((line) => (
                  <li
                    key={line}
                    className="border-t border-rule/80 py-2.5 text-[18px] leading-7 first:border-t-0 first:pt-0 last:pb-0"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {how.length > 0 ? (
            <div>
              <h3 className="text-[16px] font-medium tracking-[0.04em] text-ink-soft uppercase">
                How
              </h3>
              <ol className="mt-3 flex flex-col">
                {how.map((line, index) => (
                  <li
                    key={line}
                    className="flex gap-3 border-t border-rule/80 py-2.5 first:border-t-0 first:pt-0 last:pb-0"
                  >
                    <span
                      aria-hidden="true"
                      className="font-display w-6 shrink-0 text-[1.15rem] leading-7 text-cinnamon-deep"
                    >
                      {index + 1}
                    </span>
                    <span className="text-[18px] leading-7">{line}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 flex max-w-[40rem] flex-col gap-4">
          {blocks.map((block) => (
            <p key={block} className="whitespace-pre-wrap text-[19px] leading-8">
              {block}
            </p>
          ))}
        </div>
      )}

      {sourceUrl.startsWith("http") && sourceTitle ? (
        <p className="mt-6 border-t border-rule pt-4 text-[16px] leading-7 text-ink-soft">
          {shared ? "Started from " : "Started from Sally's "}
          <a
            href={sourceUrl}
            className="text-ink underline decoration-rule decoration-2 underline-offset-[3px] transition-colors duration-150 hover:text-cinnamon-deep hover:decoration-cinnamon-deep active:text-cocoa active:decoration-cocoa"
          >
            {sourceTitle}
          </a>
          {shared
            ? "."
            : ". Her original, if you want it. This is the version from this kitchen."}
        </p>
      ) : shared ? null : (
        <p className="mt-6 border-t border-rule pt-4 text-[16px] leading-7 text-ink-soft">
          This is the version from this kitchen.
        </p>
      )}
    </section>
  );
}
