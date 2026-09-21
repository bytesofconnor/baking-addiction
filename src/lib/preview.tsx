import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import {
  collapsePeople,
  resolveMix,
  writeMixParams,
  type MixSelection,
  type SavedMix,
} from "@/lib/cookbookMix";
import { useFamily } from "@/lib/family";

export type DummyKey = "mom" | "nana" | "brenda";

function isDummyKey(value: string | null): value is DummyKey {
  return value === "mom" || value === "nana" || value === "brenda";
}

type PreviewContextValue = {
  asKey: DummyKey | null;
  setAs: (key: DummyKey | null) => void;
  keep: (path: string) => string;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const PreviewContext = createContext<PreviewContextValue | null>(null);

const OPEN_KEY = "thatsyum-preview-open";

function readOpen(): boolean {
  if (typeof window === "undefined") {
    return true;
  }
  return window.sessionStorage.getItem(OPEN_KEY) !== "0";
}

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useSearchParams();
  const rawAs = params.get("as");
  const asKey =
    import.meta.env.DEV && isDummyKey(rawAs) ? rawAs : null;
  const [open, setOpenState] = useState(
    () => import.meta.env.DEV && readOpen(),
  );

  const setAs = useCallback(
    (key: DummyKey | null) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (key) {
            next.set("as", key);
          } else {
            next.delete("as");
          }
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const setOpen = useCallback((next: boolean) => {
    setOpenState(next);
    window.sessionStorage.setItem(OPEN_KEY, next ? "1" : "0");
  }, []);

  const keep = useCallback(
    (path: string) => {
      if (!import.meta.env.DEV) {
        return path;
      }
      const next = new URLSearchParams();
      const month = params.get("month");
      const as = params.get("as");
      if (month) {
        next.set("month", month);
      }
      if (as) {
        next.set("as", as);
      }
      const search = next.toString();
      return search.length > 0 ? `${path}?${search}` : path;
    },
    [params],
  );

  const value = useMemo(
    () => ({
      asKey,
      setAs,
      keep,
      open,
      setOpen,
    }),
    [asKey, keep, open, setAs, setOpen],
  );

  return (
    <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>
  );
}

export function usePreview(): PreviewContextValue {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error("usePreview must be used inside PreviewProvider");
  }
  return context;
}

export function usePeekCalled(): string | null {
  const { asKey } = usePreview();
  const { status } = useFamily();
  const cooks = useQuery(
    api.preview.dummyCooks,
    status === "in" ? {} : "skip",
  );
  if (!asKey) {
    return null;
  }
  return cooks?.find((cook) => cook.key === asKey)?.called ?? null;
}

export function useCookbookView() {
  const { status, user, canWrite } = useFamily();
  const { asKey } = usePreview();
  const [params, setParams] = useSearchParams();
  const peeking = status === "in" && asKey !== null;

  const ownPeople = useQuery(
    api.connections.list,
    status === "in" && !peeking ? {} : "skip",
  );
  const ownMixes = useQuery(
    api.mixes.list,
    status === "in" && !peeking ? {} : "skip",
  );
  const dummyBook = useQuery(
    api.preview.dummyBook,
    peeking && asKey ? { key: asKey } : "skip",
  );
  const dummyCooks = useQuery(
    api.preview.dummyCooks,
    status === "in" ? {} : "skip",
  );

  const family = collapsePeople(
    peeking ? (dummyBook?.people ?? []) : (ownPeople ?? []),
  );
  const people = family.filter((person) => person.included !== false);
  const mixes: SavedMix[] = peeking ? [] : (ownMixes ?? []);
  const peopleReady = peeking
    ? dummyBook !== undefined
    : ownPeople !== undefined && ownMixes !== undefined;
  const selection = peopleReady ? resolveMix(params, people, mixes) : null;

  const ownBakes = useQuery(
    api.bakes.listPublished,
    status === "in" && !peeking && selection
      ? {
          includeMine: selection.includeMine,
          otherUserIds: selection.otherUserIds,
        }
      : "skip",
  );
  const peekedBakes = useQuery(
    api.preview.dummyBakes,
    peeking && asKey && selection
      ? {
          key: asKey,
          includeMine: selection.includeMine,
          otherUserIds: selection.otherUserIds,
        }
      : "skip",
  );

  const currentBakes = peeking ? peekedBakes : ownBakes;
  type SettledBakes = Exclude<typeof currentBakes, undefined>;
  const bookKey = peeking
    ? asKey
      ? `peek:${asKey}`
      : null
    : status === "in" && user
      ? `user:${user._id}`
      : null;
  const settledBakes = useRef<{
    key: string;
    value: SettledBakes;
  } | null>(null);

  if (bookKey && currentBakes !== undefined) {
    settledBakes.current = { key: bookKey, value: currentBakes };
  }

  const bakes =
    currentBakes ??
    (settledBakes.current?.key === bookKey
      ? settledBakes.current.value
      : undefined);

  const applyMix = useCallback(
    (next: MixSelection) => {
      setParams(writeMixParams(params, next, people, mixes), { replace: true });
    },
    [mixes, params, people, setParams],
  );

  return {
    peeking,
    asKey,
    asCalled: dummyBook?.called ?? null,
    people,
    family,
    mixes,
    selection,
    bakes,
    bakesRefreshing: currentBakes === undefined && bakes !== undefined,
    ready:
      peopleReady &&
      bakes !== undefined,
    selfCalled: peeking
      ? (dummyBook?.called ?? "Family")
      : (user?.called ?? "You"),
    selfId: (peeking ? dummyBook?.userId : user?._id) as
      | Id<"users">
      | undefined,
    canWrite: canWrite && !peeking,
    dummyCooks: dummyCooks ?? [],
    applyMix,
  };
}
