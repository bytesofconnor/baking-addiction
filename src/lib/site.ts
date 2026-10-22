import { DESK_PATH } from "@/lib/desk";

export const SITE_NAME = "The Family Recipe Book";
export const SITE_SHORT = "The Family Recipe Book";
export const SITE_LINE = "Family favorites, all in one place.";
export const FAMILY_LINE = "Family favorites, all in one place.";
export const BAKER_NAME = "Mom";

export function pageHeading(
  pathname: string,
  recipeTitle?: string | null,
): {
  lead: string;
  accent: string;
  home: boolean;
  compact: boolean;
} {
  if (pathname.startsWith("/bakes/")) {
    if (recipeTitle?.trim()) {
      return { ...recipeHeading(recipeTitle.trim()), home: false, compact: true };
    }
    return { lead: "", accent: "", home: false, compact: true };
  }
  if (pathname.startsWith("/family/")) {
    return { lead: "My", accent: "family", home: false, compact: false };
  }
  if (pathname === DESK_PATH) {
    return { lead: "Add a", accent: "recipe", home: false, compact: false };
  }
  if (pathname === "/join") {
    return { lead: "The Family Recipe", accent: "Book", home: false, compact: false };
  }
  if (pathname === "/faq") {
    return { lead: "FAQ", accent: "", home: false, compact: true };
  }
  if (pathname === "/you" || pathname.startsWith("/you/")) {
    return { lead: "Your", accent: "kitchen", home: false, compact: false };
  }
  return { lead: "All", accent: "Recipes", home: true, compact: false };
}

function recipeHeading(title: string): { lead: string; accent: string } {
  const comma = title.lastIndexOf(",");
  if (comma > 2 && comma < title.length - 2) {
    return {
      lead: title.slice(0, comma).trim(),
      accent: title.slice(comma + 1).trim(),
    };
  }
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    return {
      lead: words.slice(0, -1).join(" "),
      accent: words[words.length - 1] ?? "",
    };
  }
  return { lead: title, accent: "" };
}

const MOM_NAMES = new Set(["mom"]);

export function bookSignedName(called: string | undefined): string | undefined {
  const who = called?.trim() || "";
  if (who.length === 0) {
    return undefined;
  }
  if (MOM_NAMES.has(who.toLowerCase())) {
    return "Mom";
  }
  return who;
}
