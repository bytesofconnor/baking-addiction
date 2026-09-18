import { Kicker } from "@/components/Kicker";

export function KitchenMethod({
  method,
  sourceTitle,
  sourceUrl,
}: {
  method?: string;
  sourceTitle: string;
  sourceUrl: string;
}) {
  const text = method?.trim() ?? "";
  if (text.length === 0) {
    return null;
  }

  const blocks = text.split("\n\n").filter((block) => block.length > 0);

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
        How we made it
      </h2>
      <div className="mt-4 flex max-w-[40rem] flex-col gap-4">
        {blocks.map((block) => (
          <p key={block} className="whitespace-pre-wrap text-[19px] leading-8">
            {block}
          </p>
        ))}
      </div>
      <p className="mt-5 border-t border-rule pt-4 text-[16px] leading-7 text-ink-soft">
        Started from Sally&apos;s{" "}
        <a
          href={sourceUrl}
          className="text-ink underline decoration-rule decoration-2 underline-offset-[3px] transition-colors duration-150 hover:text-cinnamon-deep hover:decoration-cinnamon-deep active:text-cocoa active:decoration-cocoa"
        >
          {sourceTitle}
        </a>
        . Her original, if you want it. This is the version from this kitchen.
      </p>
    </section>
  );
}
