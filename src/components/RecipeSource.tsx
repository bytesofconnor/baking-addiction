import { SallyCredit } from "@/components/SallyCredit";
import { sourceLine, type SourceKind } from "@/lib/sources";
import { inferSourceKind } from "../../convex/lib/sources";

export function RecipeSource({
  sourceKind,
  sourceTitle,
  sourceUrl,
}: {
  sourceKind?: SourceKind;
  sourceTitle?: string;
  sourceUrl?: string;
}) {
  const kind = inferSourceKind(sourceKind, sourceUrl ?? "");
  if (kind === "sally" && sourceUrl && sourceTitle) {
    return <SallyCredit title={sourceTitle} url={sourceUrl} />;
  }
  const line = sourceLine(kind, sourceTitle);
  const linkable =
    Boolean(sourceUrl) &&
    (kind === "sally" || kind === "tiktok" || kind === "pinterest");
  return (
    <p className="max-w-[36rem] text-[17px] leading-7 text-ink-soft">
      {linkable ? (
        <a
          href={sourceUrl}
          className="underline decoration-rule underline-offset-4 hover:text-cinnamon-deep hover:decoration-cinnamon-deep"
        >
          {line}
        </a>
      ) : (
        line
      )}
      . Cook from the notes on this page.
    </p>
  );
}
