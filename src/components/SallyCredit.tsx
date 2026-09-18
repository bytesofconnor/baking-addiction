export function SallyCredit({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  return (
    <p className="max-w-[36rem] text-[17px] leading-7 text-ink-soft">
      Started from Sally&apos;s{" "}
      <a
        href={url}
        className="text-ink underline decoration-rule decoration-2 underline-offset-[3px] transition-colors duration-150 hover:text-cinnamon-deep hover:decoration-cinnamon-deep active:text-cocoa active:decoration-cocoa"
      >
        {title}
      </a>
      . Her recipe started this; cook from the notes on this page.
    </p>
  );
}
