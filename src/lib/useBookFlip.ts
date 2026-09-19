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
  clone.setAttribute("inert", "");
  const fromSheet = face.querySelector(".book-sheet-inner");
  const toSheet = clone.querySelector(".book-sheet-inner");
  if (fromSheet && toSheet) {
    toSheet.scrollTop = fromSheet.scrollTop;
  }
  return clone;
}

export function useBookFlip(liveFace: RefObject<HTMLElement | null>): {
  pathname: string;
  flip: FlipPlan | null;
  ghost: HTMLElement | null;
} {
  const location = useLocation();
  const pathRef = useRef(location.pathname);
  const keyRef = useRef(location.key);
  const ghostRef = useRef<HTMLElement | null>(null);
  const endTimer = useRef(0);

  const [pathname, setPathname] = useState(location.pathname);
  const [flip, setFlip] = useState<FlipPlan | null>(null);
  const [ghost, setGhost] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (location.key === keyRef.current) {
      return;
    }

    function settleHere() {
      keyRef.current = location.key;
      pathRef.current = location.pathname;
      ghostRef.current = null;
      window.clearTimeout(endTimer.current);
      setGhost(null);
      setFlip(null);
      setPathname(location.pathname);
    }

    if (location.pathname === pathRef.current) {
      settleHere();
      return;
    }

    if (!shouldFlip(pathRef.current, location.pathname) || prefersReducedMotion()) {
      settleHere();
      return;
    }

    const plan = planFlip(pathRef.current, location.pathname);
    const face = liveFace.current;
    const shot = face ? snapshotFace(face) : null;
    ghostRef.current = shot;
    keyRef.current = location.key;
    pathRef.current = location.pathname;
    setGhost(shot);
    setPathname(location.pathname);
    setFlip(plan);

    window.clearTimeout(endTimer.current);
    endTimer.current = window.setTimeout(() => {
      ghostRef.current = null;
      setGhost(null);
      setFlip(null);
    }, plan.durationMs);

    return () => {
      window.clearTimeout(endTimer.current);
    };
  }, [liveFace, location.key, location.pathname]);

  return { pathname, flip, ghost };
}
