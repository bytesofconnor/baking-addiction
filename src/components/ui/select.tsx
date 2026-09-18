import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "min-h-14 w-full cursor-pointer appearance-none rounded-lg border border-rule bg-paper-raised bg-[length:1.1rem] bg-[position:right_1.15rem_center] bg-no-repeat py-2 pl-4 pr-14 text-[18px] leading-7 text-ink transition-colors duration-150 hover:border-cocoa focus-visible:border-cinnamon-deep focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cinnamon-deep",
        className,
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' stroke='%234a3728' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
      }}
      {...props}
    />
  );
}
