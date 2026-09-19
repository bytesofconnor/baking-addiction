import * as LabelPrimitive from "@radix-ui/react-label";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Label({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        "block cursor-pointer text-[18px] leading-7 font-medium text-ink-soft",
        className,
      )}
      {...props}
    />
  );
}
