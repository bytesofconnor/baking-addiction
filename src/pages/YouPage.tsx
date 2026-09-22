import { useState, type FormEvent } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MadeLog } from "@/components/MadeLog";
import { RedirectToJoin } from "@/components/RedirectToJoin";
import { FamilyBook } from "@/pages/FamilyPage";
import { useFamily } from "@/lib/family";
import { PageTitle } from "@/lib/pageTitle";
import { usePreview } from "@/lib/preview";
import { SITE_SHORT } from "@/lib/site";
import { useToast } from "@/lib/toast";

export function YouPage() {
  const { status, user, signOut } = useFamily();
  const { keep } = usePreview();
  const setCalled = useMutation(api.familyAuth.setCalled);
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [called, setCalledDraft] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const onFamily = location.pathname.startsWith("/you/family");

  if (status === "checking") {
    return <p role="status">Opening your page…</p>;
  }

  if (status === "out" || !user) {
    return <RedirectToJoin />;
  }

  const name = called ?? user.called;

  async function saveName(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      await setCalled({ called: name });
      toast.success("Name saved.");
    } catch (caught) {
      toast.error(
        caught instanceof Error
          ? caught.message
          : "Couldn’t save that name.",
      );
    } finally {
      setPending(false);
    }
  }

  async function leave() {
    setLeaving(true);
    try {
      await signOut();
      navigate("/join", { replace: true });
    } catch {
      toast.error("Couldn’t sign out. Try once more.");
      setLeaving(false);
    }
  }

  return (
    <div className="max-w-[40rem]">
      <PageTitle
        title={onFamily ? `Family · ${SITE_SHORT}` : `${name} · ${SITE_SHORT}`}
      />
      <nav className="book-tabs" aria-label="Your kitchen">
        <NavLink to={keep("/you")} end className="book-tab">
          You
        </NavLink>
        <NavLink to={keep("/you/family")} className="book-tab">
          Family
        </NavLink>
      </nav>

      {onFamily ? (
        <FamilyBook />
      ) : (
        <>
          <form
            className="mt-8 flex flex-col gap-3"
            onSubmit={(event) => void saveName(event)}
          >
            <Label htmlFor="called">Call me</Label>
            <Input
              id="called"
              value={name}
              onChange={(event) => {
                setCalledDraft(event.target.value);
              }}
              autoComplete="nickname"
              autoCapitalize="words"
              enterKeyHint="done"
              className="min-h-14"
            />
            <div>
              <button
                type="submit"
                className="book-press book-press-text book-press-save"
                disabled={pending}
                aria-busy={pending}
              >
                {pending ? "Saving…" : "Save"}
              </button>
            </div>
          </form>

          <div className="mt-12">
            <MadeLog />
          </div>

          <div className="mt-12">
            <p className="text-[16px] leading-6 text-ink-soft">Signed in as</p>
            <p className="mt-1 text-[18px] leading-7 text-ink break-words">
              {user.email || "No email on this Google."}
            </p>
          </div>

          <div className="mt-8">
            <button
              type="button"
              className="book-press book-press-text"
              disabled={leaving}
              aria-busy={leaving}
              onClick={() => void leave()}
            >
              {leaving ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
