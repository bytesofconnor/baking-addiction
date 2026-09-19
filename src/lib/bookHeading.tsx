import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const BookHeadingContext = createContext<{
  recipeTitle: string | null;
  setRecipeTitle: (title: string | null) => void;
} | null>(null);

export function BookHeadingProvider({ children }: { children: ReactNode }) {
  const [recipeTitle, setTitle] = useState<string | null>(null);
  const setRecipeTitle = useCallback((title: string | null) => {
    setTitle(title);
  }, []);
  const value = useMemo(
    () => ({ recipeTitle, setRecipeTitle }),
    [recipeTitle, setRecipeTitle],
  );
  return (
    <BookHeadingContext.Provider value={value}>
      {children}
    </BookHeadingContext.Provider>
  );
}

export function useBookHeading() {
  return useContext(BookHeadingContext);
}

export function useRecipeTitle(title: string | null) {
  const heading = useBookHeading();
  const setRecipeTitle = heading?.setRecipeTitle;
  useEffect(() => {
    if (title) {
      setRecipeTitle?.(title);
    }
  }, [setRecipeTitle, title]);
}
