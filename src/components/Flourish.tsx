import { WhiskMark } from "@/components/WhiskMark";
import { cn } from "@/lib/utils";

export function Flourish({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center gap-3 text-cinnamon", className)}
      aria-hidden="true"
    >
      <span className="h-px flex-1 bg-rule" />
      <WhiskMark className="h-5 w-5" />
      <span className="h-px flex-1 bg-rule" />
    </div>
  );
}
