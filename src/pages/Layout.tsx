import { Outlet, useLocation } from "react-router";
import { Flourish } from "@/components/Flourish";
import { SiteHeader } from "@/components/SiteHeader";
import { useWriter } from "@/lib/writer";

export function Layout() {
  const { status } = useWriter();
  const { pathname } = useLocation();
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[56rem] pb-[max(4rem,env(safe-area-inset-bottom))] pl-12 pr-5 pt-6 md:max-w-[80rem] md:pl-28 md:pr-14 md:pt-8 xl:max-w-[92rem] xl:pr-16">
      <a
        href="#main"
        className="skip-link"
        onClick={() => {
          document.getElementById("main")?.focus();
        }}
      >
        Skip to the cookbook
      </a>
      <div aria-hidden="true" className="notebook-holes" />
      <div aria-hidden="true" className="notebook-spine" />
      <SiteHeader
        showWrite={status === "unlocked"}
        atmosphere={pathname === "/"}
      />
      <main id="main" className="pt-10" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="mt-20">
        <Flourish className="mb-6" />
        <div className="flex flex-col gap-2 text-[16px] leading-6 text-ink-soft sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <p>
            Chris Barrett · started from{" "}
            <a
              href="https://sallysbakingaddiction.com"
              className="underline decoration-rule decoration-2 underline-offset-[3px] transition-colors duration-150 hover:text-cinnamon-deep hover:decoration-cinnamon-deep active:text-cocoa active:decoration-cocoa"
            >
              Sally&apos;s Baking Addiction
            </a>
            .
          </p>
          <p className="font-display text-[18px] leading-6 text-cocoa italic">
            My Addiction with Sally&apos;s
          </p>
        </div>
      </footer>
    </div>
  );
}
