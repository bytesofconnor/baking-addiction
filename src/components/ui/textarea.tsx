import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-40 w-full cursor-text rounded-lg border-[1.5px] border-cocoa/55 bg-paper-raised px-3 py-3 text-[20px] leading-8 text-ink placeholder:text-ink-soft/90 transition-colors duration-150 hover:border-cocoa focus-visible:border-cinnamon-deep focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cinnamon-deep",
        className,
      )}
      {...props}
    />
  );
}
