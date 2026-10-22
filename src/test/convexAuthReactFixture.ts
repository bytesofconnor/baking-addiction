import type { ReactNode } from "react";

export function ConvexAuthProvider({ children }: { children: ReactNode }) {
  return children;
}

export function useAuthActions() {
  return {
    signIn: async () => undefined,
    signOut: async () => undefined,
  };
}
