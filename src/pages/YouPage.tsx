import { useId, useRef, useState, type FormEvent } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BakerAvatar } from "@/components/BakerAvatar";
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
  const generateUploadUrl = useMutation(api.familyAuth.generateUploadUrl);
  const setAvatar = useMutation(api.familyAuth.setAvatar);
  const clearAvatar = useMutation(api.familyAuth.clearAvatar);
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const avatarInputId = useId();
  const avatarInput = useRef<HTMLInputElement>(null);
  const [called, setCalledDraft] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
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

  async function uploadAvatar(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Pick a photo.");
      return;
    }
    setAvatarBusy(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!response.ok) {
        throw new Error("The photo didn’t upload. Try one more time.");
      }
      const { storageId } = (await response.json()) as {
        storageId: Id<"_storage">;
      };
      await setAvatar({ storageId });
      toast.success("Photo saved.");
    } catch (caught) {
      toast.error(
        caught instanceof Error
          ? caught.message
          : "Couldn’t save that photo.",
      );
    } finally {
      setAvatarBusy(false);
    }
  }

  async function removeAvatar() {
    setAvatarBusy(true);
    try {
      await clearAvatar();
      toast.success("Photo cleared.");
    } catch (caught) {
      toast.error(
        caught instanceof Error
          ? caught.message
          : "Couldn’t clear that photo.",
      );
    } finally {
      setAvatarBusy(false);
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
          <div className="book-you-portrait mt-8">
            <BakerAvatar
              name={name}
              url={user.avatarUrl}
              size="lg"
              className="book-you-portrait-face"
            />
            <div className="book-you-portrait-actions">
              <input
                ref={avatarInput}
                id={avatarInputId}
                type="file"
                accept="image/*"
                capture="user"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) {
                    void uploadAvatar(file);
                  }
                }}
              />
              <button
                type="button"
                className="book-press book-press-text"
                disabled={avatarBusy}
                aria-busy={avatarBusy}
                onClick={() => avatarInput.current?.click()}
              >
                {avatarBusy
                  ? "Saving…"
                  : user.avatarUrl
                    ? "Change photo"
                    : "Add a photo"}
              </button>
              {user.hasCustomAvatar ? (
                <button
                  type="button"
                  className="book-you-portrait-clear"
                  disabled={avatarBusy}
                  onClick={() => void removeAvatar()}
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>

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
            <button
              type="button"
              className="book-press book-press-text mt-4"
              disabled={leaving}
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
