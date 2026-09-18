import { NavLink } from "react-router";
import { Wordmark } from "@/components/Wordmark";
import { DESK_PATH } from "@/lib/desk";
import { cn } from "@/lib/utils";

function navClass(isActive: boolean) {
  return [
    "inline-flex min-h-14 cursor-pointer items-center px-1 text-[18px] underline underline-offset-[6px] rounded-[2px] touch-manipulation transition-colors duration-150",
    isActive
      ? "font-semibold text-ink decoration-2 decoration-cinnamon-deep hover:text-cocoa active:text-cocoa"
      : "text-ink decoration-rule hover:text-cinnamon-deep hover:decoration-cinnamon-deep active:text-cocoa active:decoration-cocoa",
  ].join(" ");
}

export function SiteHeader({
  showWrite,
  atmosphere = false,
}: {
  showWrite: boolean;
  atmosphere?: boolean;
}) {
  return (
    <header className={cn("relative isolate", atmosphere && "min-h-[13.5rem]")}>
      {atmosphere ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-6 bottom-0 -z-10 overflow-hidden md:-top-8"
        >
          <img
            src="/cookies-cupcakes-sketch.png"
            alt=""
            className="header-sketch absolute inset-0 h-full w-full object-cover object-[70%_42%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/55 to-transparent md:max-w-[28rem]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-paper" />
        </div>
      ) : null}
      <p className="text-[16px] leading-6 text-cinnamon-deep">
        From Mom&apos;s kitchen
      </p>
      <div className="mt-3">
        <Wordmark />
      </div>
      <p className="mt-3 max-w-[34rem] text-[18px] leading-7 text-ink-soft">
        The swaps, the notes, with Sally.
      </p>
      <nav
        aria-label="Primary"
        className="mt-5 flex flex-wrap gap-x-6 gap-y-1 border-y-[3px] border-double border-cocoa/35 py-1"
      >
        <NavLink to="/" end className={({ isActive }) => navClass(isActive)}>
          The cookbook
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => navClass(isActive)}>
          About Mom
        </NavLink>
        {showWrite ? (
          <NavLink to={DESK_PATH} className={({ isActive }) => navClass(isActive)}>
            Write
          </NavLink>
        ) : null}
      </nav>
    </header>
  );
}
