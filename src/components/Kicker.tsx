import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Kicker({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-[18px] leading-7 text-cinnamon-deep", className)}>
      {children}
    </p>
  );
}
