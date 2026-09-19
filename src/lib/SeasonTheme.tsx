import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router";
import {
  applySeasonTheme,
  liveMinnesotaMonth,
  parseMonthParam,
  themeForMonth,
  type MonthNumber,
  type MonthTheme,
} from "@/lib/season";

type SeasonControl = {
  month: MonthNumber;
  forced: boolean;
  setMonth: (month: MonthNumber | null) => void;
};

const SeasonContext = createContext<MonthTheme>(themeForMonth(9));
const SeasonControlContext = createContext<SeasonControl>({
  month: 9,
  forced: false,
  setMonth: () => undefined,
});

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useSearchParams();
  const forced = import.meta.env.DEV
    ? parseMonthParam(params.get("month"))
    : null;
  const [live, setLive] = useState(liveMinnesotaMonth);
  const month = forced ?? live;

  useLayoutEffect(() => {
    applySeasonTheme(month);
  }, [month]);

  useEffect(() => {
    if (forced) {
      return;
    }
    function sync() {
      setLive(liveMinnesotaMonth());
    }
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [forced]);

  const setMonth = useCallback(
    (next: MonthNumber | null) => {
      setParams(
        (current) => {
          const nextParams = new URLSearchParams(current);
          if (next === null) {
            nextParams.delete("month");
          } else {
            nextParams.set("month", String(next));
          }
          return nextParams;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const control = useMemo(
    () => ({ month, forced: forced !== null, setMonth }),
    [forced, month, setMonth],
  );

  return (
    <SeasonContext.Provider value={themeForMonth(month)}>
      <SeasonControlContext.Provider value={control}>
        {children}
      </SeasonControlContext.Provider>
    </SeasonContext.Provider>
  );
}

export function useSeason(): MonthTheme {
  return useContext(SeasonContext);
}

export function useSeasonControl(): SeasonControl {
  return useContext(SeasonControlContext);
}
