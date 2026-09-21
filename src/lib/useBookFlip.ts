import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useLocation } from "react-router";
import {
  planFlip,
  prefersReducedMotion,
  shouldFlip,
  type FlipPlan,
} from "@/lib/bookPages";

function snapshotFace(face: HTMLElement): HTMLElement {
  const clone = face.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("[id]").forEach((node) => {
    node.removeAttribute("id");
  });
  clone.querySelectorAll(".skip-link").forEach((node) => {
    node.remove();
  });
  clone.setAttribute("inert", "");
  const fromSheet = face.querySelector(".book-sheet-inner");
  const toSheet = clone.querySelector(".book-sheet-inner");
  if (fromSheet && toSheet) {
    toSheet.scrollTop = fromSheet.scrollTop;
  }
  return clone;
}

function resetWindowScroll() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

export function useBookFlip(liveFace: RefObject<HTMLElement | null>): {
  pathname: string;
  flip: FlipPlan | null;
  ghost: HTMLElement | null;
  /** Pixel height of the outgoing page — sized onto the turning leaf only. */
  overlayHeightPx: number | null;
} {
  const location = useLocation();
  const pathRef = useRef(location.pathname);
  const keyRef = useRef(location.key);
  const ghostRef = useRef<HTMLElement | null>(null);
  const endTimer = useRef(0);
  const midTimer = useRef(0);

  const [pathname, setPathname] = useState(location.pathname);
  const [flip, setFlip] = useState<FlipPlan | null>(null);
  const [ghost, setGhost] = useState<HTMLElement | null>(null);
  const [overlayHeightPx, setOverlayHeightPx] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (location.key === keyRef.current) {
      return;
    }

    function settleHere() {
      keyRef.current = location.key;
      pathRef.current = location.pathname;
      ghostRef.current = null;
      window.clearTimeout(endTimer.current);
      window.clearTimeout(midTimer.current);
      setGhost(null);
      setFlip(null);
      setOverlayHeightPx(null);
      setPathname(location.pathname);
      resetWindowScroll();
    }

    if (location.pathname === pathRef.current) {
      settleHere();
      return;
    }

    if (!shouldFlip(pathRef.current, location.pathname) || prefersReducedMotion()) {
      settleHere();
      return;
    }

    const previousPath = pathRef.current;
    const plan = planFlip(previousPath, location.pathname);
    keyRef.current = location.key;
    pathRef.current = location.pathname;
    window.clearTimeout(endTimer.current);
    window.clearTimeout(midTimer.current);
    resetWindowScroll();

    if (plan.kind === "book") {
      // Freeze the outgoing back cover so arrival state changes cannot make
      // its content disappear before the physical book reaches edge-on.
      const face = liveFace.current;
      const shot = previousPath === "/faq" && face ? snapshotFace(face) : null;
      ghostRef.current = shot;
      setGhost(shot);
      setOverlayHeightPx(null);
      setFlip(plan);
      midTimer.current = window.setTimeout(() => {
        ghostRef.current = null;
        setGhost(null);
        setPathname(location.pathname);
      }, plan.durationMs / 2);
      endTimer.current = window.setTimeout(() => {
        setFlip(null);
      }, plan.durationMs);

      return () => {
        window.clearTimeout(endTimer.current);
        window.clearTimeout(midTimer.current);
      };
    }

    const face = liveFace.current;
    const pages = face?.closest(".book-pages");
    const overlayHeight =
      pages instanceof HTMLElement
        ? Math.round(pages.getBoundingClientRect().height)
        : null;
    const shot = face ? snapshotFace(face) : null;
    ghostRef.current = shot;
    setGhost(shot);
    setOverlayHeightPx(overlayHeight && overlayHeight > 0 ? overlayHeight : null);
    setPathname(location.pathname);
    setFlip(plan);

    endTimer.current = window.setTimeout(() => {
      ghostRef.current = null;
      setGhost(null);
      setFlip(null);
      setOverlayHeightPx(null);
    }, plan.durationMs);

    return () => {
      window.clearTimeout(endTimer.current);
      window.clearTimeout(midTimer.current);
    };
  }, [liveFace, location.key, location.pathname]);

  return { pathname, flip, ghost, overlayHeightPx };
}
