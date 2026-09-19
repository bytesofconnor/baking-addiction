import { useEffect } from "react";
import { usePageActive } from "@/lib/pageActive";
import { SITE_NAME } from "@/lib/site";

export function PageTitle({ title }: { title: string }) {
  const active = usePageActive();
  useEffect(() => {
    if (!active) {
      return;
    }
    document.title = title;
  }, [active, title]);
  useEffect(() => {
    return () => {
      document.title = SITE_NAME;
    };
  }, []);
  return null;
}
