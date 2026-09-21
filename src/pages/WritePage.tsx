import { useEffect, useId, useState, type FormEvent } from "react";
import { useLocation, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Kicker } from "@/components/Kicker";
import { WhiskMark } from "@/components/WhiskMark";
import { WriteDesk } from "@/components/WriteDesk";
import { DESK_PATH } from "@/lib/desk";
import { PageTitle } from "@/lib/pageTitle";
import { SITE_SHORT } from "@/lib/site";
import { useFamily } from "@/lib/family";
import { useWriter } from "@/lib/writer";

export function WritePage() {
  const { status, token, unlock, lock } = useWriter();
  const family = useFamily();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  // Kitchen door links are `?code=` on /add only. Everywhere else that param
  // is the Google OAuth callback and must not be treated as a desk password.
  const onDesk = location.pathname === DESK_PATH;
  const [linkCode, setLinkCode] = useState("");
  const [openingLink, setOpeningLink] = useState(false);
  const [linkFailed, setLinkFailed] = useState(false);

  useEffect(() => {
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    return () => {
      robots.remove();
    };
  }, []);

  useEffect(() => {
    if (!onDesk || !params.has("code")) {
      return;
    }
    const code = params.get("code")?.trim() ?? "";
    if (code) {
      setLinkCode(code);
      setOpeningLink(true);
    }
    const next = new URLSearchParams(params);
    next.delete("code");
    setParams(next, { replace: true });
  }, [onDesk, params, setParams]);

  useEffect(() => {
    if (!linkCode || status !== "locked") {
      if (status === "unlocked") {
        setOpeningLink(false);
      }
      return;
    }
    let cancelled = false;
    setOpeningLink(true);
    void unlock(linkCode)
      .catch(() => {
        if (!cancelled) {
          setLinkFailed(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setOpeningLink(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [linkCode, status, unlock]);

  if (family.status === "checking") {
    return (
      <>
        <PageTitle title={`Write · ${SITE_SHORT}`} />
        <p role="status">Opening the kitchen door…</p>
      </>
    );
  }

  if (family.status === "in" && family.canWrite && family.kitchenId) {
    return (
      <WriteDesk
        kitchenId={family.kitchenId}
        bakerName={family.user?.called}
      />
    );
  }

  if (status === "checking" || openingLink) {
    return (
      <>
        <PageTitle title={`Write · ${SITE_SHORT}`} />
        <p role="status">Opening the kitchen door…</p>
      </>
    );
  }

  if (status === "locked") {
    return (
      <KitchenDoor
        onUnlock={unlock}
        initialCode={linkFailed ? linkCode : ""}
      />
    );
  }

  return <WriteDesk token={token} onLock={lock} />;
}

function KitchenDoor({
  onUnlock,
  initialCode,
}: {
  onUnlock: (code: string) => Promise<void>;
  initialCode: string;
}) {
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const errorId = useId();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await onUnlock(code);
    } catch {
      setError("That code didn't work.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      className="max-w-[28rem]"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <PageTitle title={`Kitchen code · ${SITE_SHORT}`} />
      <WhiskMark className="h-10 w-10 text-cinnamon" />
      <Kicker className="mt-4">For Mom</Kicker>
      <h1 className="font-display mt-3 text-[2.5rem] leading-[1.1] tracking-tight">
        The kitchen door
      </h1>
      <p className="mt-4 text-[19px] leading-8 text-ink-soft">
        Connor sent you a link. If it didn&apos;t open on its own, type the
        kitchen code once. This device will remember you.
      </p>
      <Label htmlFor="kitchen-code" className="mt-8">
        Kitchen code
      </Label>
      <input
        type="text"
        name="username"
        autoComplete="username"
        defaultValue="mom"
        readOnly
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      />
      <Input
        id="kitchen-code"
        name="password"
        type="text"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        autoComplete="current-password"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        autoFocus
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="mt-2 min-h-14"
      />
      {error ? (
        <p id={errorId} role="alert" className="mt-4 text-[17px] text-cinnamon-deep">
          {error}
        </p>
      ) : null}
      <div className="mt-8">
        <Button type="submit" disabled={pending} aria-busy={pending} className="w-full sm:w-auto">
          Open the kitchen
        </Button>
      </div>
    </form>
  );
}
