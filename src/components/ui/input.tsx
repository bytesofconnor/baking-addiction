import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-12 w-full cursor-text rounded-lg border border-rule bg-paper-raised px-3 text-[20px] leading-7 text-ink placeholder:text-ink-soft transition-colors duration-150 hover:border-cocoa focus-visible:border-cinnamon-deep focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cinnamon-deep file:mr-3 file:min-h-14 file:cursor-pointer file:rounded-lg file:border-0 file:bg-cinnamon-deep file:px-4 file:text-[16px] file:font-medium file:text-[#fbf7f0] hover:file:bg-cocoa active:file:bg-ink [&[type=date]]:cursor-pointer [&[type=file]]:cursor-pointer [&[type=search]]:cursor-text",
        className,
      )}
      {...props}
    />
  );
}
