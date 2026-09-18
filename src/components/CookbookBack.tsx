import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CookbookBack({ className }: { className?: string }) {
  const navigate = useNavigate();

  return (
    <Button
      type="button"
      variant="secondary"
      className={cn("w-full sm:w-auto", className)}
      onClick={() => {
        const idx = window.history.state?.idx;
        if (typeof idx === "number" && idx > 0) {
          navigate(-1);
          return;
        }
        navigate("/");
      }}
    >
      Back to the cookbook
    </Button>
  );
}
