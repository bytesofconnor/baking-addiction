import { Link } from "react-router";

export function Wordmark({ linked = true }: { linked?: boolean }) {
  const mark = (
    <span className="flex min-w-0 flex-col">
      <span className="font-display text-[2.1rem] leading-[1.08] tracking-tight transition-colors duration-150 group-hover:text-cinnamon-deep group-active:text-cocoa md:text-[2.7rem]">
        My Addiction
      </span>
      <span className="font-display mt-1 text-[1.2rem] leading-7 text-cocoa italic transition-colors duration-150 group-hover:text-cinnamon-deep group-active:text-cocoa md:text-[1.4rem]">
        with Sally&apos;s Baking Addiction
      </span>
    </span>
  );

  if (!linked) {
    return mark;
  }

  return (
    <Link
      to="/"
      className="group inline-block min-w-0 py-1"
      aria-label="My Addiction, back to the cookbook"
    >
      {mark}
    </Link>
  );
}
