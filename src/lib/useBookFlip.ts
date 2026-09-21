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
  const midTimer = useRef(0);

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
      window.clearTimeout(midTimer.current);
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

    const previousPath = pathRef.current;
    const plan = planFlip(previousPath, location.pathname);
    keyRef.current = location.key;
    pathRef.current = location.pathname;
    window.clearTimeout(endTimer.current);
    window.clearTimeout(midTimer.current);

    if (plan.kind === "book") {
      // Freeze the outgoing back cover so arrival state changes cannot make
      // its content disappear before the physical book reaches edge-on.
      const face = liveFace.current;
      const shot = previousPath === "/faq" && face ? snapshotFace(face) : null;
      ghostRef.current = shot;
      setGhost(shot);
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
    const shot = face ? snapshotFace(face) : null;
    ghostRef.current = shot;
    setGhost(shot);
    setPathname(location.pathname);
    setFlip(plan);

    endTimer.current = window.setTimeout(() => {
      ghostRef.current = null;
      setGhost(null);
      setFlip(null);
    }, plan.durationMs);

    return () => {
      window.clearTimeout(endTimer.current);
      window.clearTimeout(midTimer.current);
    };
  }, [liveFace, location.key, location.pathname]);

  return { pathname, flip, ghost };
}
