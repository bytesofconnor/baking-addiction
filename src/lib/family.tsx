import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { clearKitchenId, readKitchenId, writeKitchenId } from "@/lib/familySession";
import { clearOAuthReturn, isOAuthReturn } from "@/lib/oauthReturn";

type FamilyStatus = "checking" | "out" | "in";

export type Kitchen = {
  _id: Id<"kitchens">;
  name: string;
  ownerCalled: string;
  role: "owner" | "cook" | "reader";
};

type FamilyUser = {
  _id: Id<"users">;
  called: string;
  email: string;
};

type FamilyContextValue = {
  status: FamilyStatus;
  user: FamilyUser | null;
  kitchens: Kitchen[];
  mine: Kitchen | null;
  theirs: Kitchen[];
  kitchenId: Id<"kitchens"> | null;
  kitchen: Kitchen | null;
  isOwnBook: boolean;
  canWrite: boolean;
  canInvite: boolean;
  setKitchenId: (id: Id<"kitchens">) => void;
  signOut: () => Promise<void>;
};

const FamilyContext = createContext<FamilyContextValue | null>(null);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut: authSignOut } = useAuthActions();
  const [kitchenId, setKitchenState] = useState<Id<"kitchens"> | null>(null);
  const [kitchenReady, setKitchenReady] = useState(false);
  const [comingBack, setComingBack] = useState(isOAuthReturn);

  useEffect(() => {
    const kitchen = readKitchenId();
    if (kitchen) {
      setKitchenState(kitchen as Id<"kitchens">);
    }
    setKitchenReady(true);
  }, []);

  const me = useQuery(api.familyAuth.me, isAuthenticated ? {} : "skip");
  const ensureMine = useMutation(api.kitchens.ensureMine);
  const plantFamily = useMutation(api.seedFamily.intoMyBook);
  const planted = useRef(false);

  const kitchens = me?.kitchens ?? [];
  const mine = kitchens.find((kitchen) => kitchen.role === "owner") ?? null;
  const theirs = kitchens.filter((kitchen) => kitchen.role !== "owner");
  const resolvedKitchen = mine;

  useEffect(() => {
    if (mine && mine._id !== kitchenId) {
      setKitchenState(mine._id);
      writeKitchenId(mine._id);
    }
  }, [kitchenId, mine]);

  const setKitchenId = useCallback((id: Id<"kitchens">) => {
    setKitchenState(id);
    writeKitchenId(id);
  }, []);

  const signOut = useCallback(async () => {
    clearOAuthReturn();
    setComingBack(false);
    clearKitchenId();
    await authSignOut();
  }, [authSignOut]);

  useEffect(() => {
    if (isAuthenticated) {
      clearOAuthReturn();
      setComingBack(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!me) {
      return;
    }
    let cancelled = false;
    void ensureMine()
      .then(async (id) => {
        if (cancelled) {
          return;
        }
        setKitchenState(id);
        writeKitchenId(id);
        if (!planted.current) {
          planted.current = true;
          await plantFamily({}).catch(() => {
            // Planting sample data is optional, don't block
          });
        }
      })
      .catch((error) => {
        console.error("Failed to ensure kitchen:", error);
        // Don't block on kitchen creation failure - let user proceed
      });
    return () => {
      cancelled = true;
    };
  }, [ensureMine, me, plantFamily]);

  const status: FamilyStatus =
    isLoading ||
    !kitchenReady ||
    comingBack
      ? "checking"
      : isAuthenticated && me === undefined
      ? "checking"
      : me
      ? "in"
      : "out";

  const value = useMemo(
    () => ({
      status,
      user: me?.user ?? null,
      kitchens,
      mine,
      theirs,
      kitchenId: resolvedKitchen?._id ?? kitchenId,
      kitchen: resolvedKitchen,
      isOwnBook: status === "in",
      canWrite: status === "in",
      canInvite: mine !== null,
      setKitchenId,
      signOut,
    }),
    [
      kitchenId,
      kitchens,
      me,
      mine,
      resolvedKitchen,
      setKitchenId,
      signOut,
      status,
      theirs,
    ],
  );

  return (
    <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error("useFamily must be used inside FamilyProvider");
  }
  return context;
}
