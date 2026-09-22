import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Kicker } from "@/components/Kicker";
import { BakerAvatar } from "@/components/BakerAvatar";
import { useFamily } from "@/lib/family";
import { useCookbookView } from "@/lib/preview";
import { collapsePeople } from "@/lib/cookbookMix";
import { useToast } from "@/lib/toast";

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy path.
  }
  try {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.left = "-9999px";
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(field);
    return ok;
  } catch {
    return false;
  }
}

function PencilMark() {
  return (
    <svg className="family-pencil" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M15.6 4.4 19.6 8.4 8.5 19.5 4 20l.5-4.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M13.8 6.2 17.8 10.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FamilyPerson({
  person,
  canEdit,
  flipping,
  onFlip,
  onError,
}: {
  person: {
    otherUserId: Id<"users">;
    called: string;
    email?: string;
    included?: boolean;
    avatarUrl?: string | null;
  };
  canEdit: boolean;
  flipping: boolean;
  onFlip: (included: boolean) => void;
  onError: (message: string) => void;
}) {
  const setCalled = useMutation(api.connections.setCalled);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(person.called);
  const [saving, setSaving] = useState(false);
  const on = person.included !== false;

  useEffect(() => {
    if (!editing) {
      setDraft(person.called);
    }
  }, [editing, person.called]);

  async function save() {
    const next = draft.trim();
    setEditing(false);
    if (next === person.called) {
      setDraft(person.called);
      return;
    }
    setSaving(true);
    try {
      await setCalled({ otherUserId: person.otherUserId, called: next });
    } catch (caught) {
      onError(
        caught instanceof Error ? caught.message : "Couldn’t save that name.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="family-person" data-on={on}>
      <BakerAvatar
        name={person.called}
        url={person.avatarUrl}
        size="md"
        className="family-person-face"
      />
      <span className="family-person-copy">
        {canEdit && editing ? (
          <input
            value={draft}
            aria-label="What you call them"
            autoComplete="off"
            autoFocus
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => void save()}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.blur();
              }
              if (event.key === "Escape") {
                setDraft(person.called);
                setEditing(false);
              }
            }}
            className="family-name-field"
          />
        ) : canEdit ? (
          <button
            type="button"
            className="family-name"
            onClick={() => setEditing(true)}
          >
            <span>{saving ? draft.trim() || person.called : person.called}</span>
            <PencilMark />
          </button>
        ) : (
          <span className="family-name-plain">{person.called}</span>
        )}
        {person.email ? (
          <span className="family-person-email">{person.email}</span>
        ) : null}
      </span>
      {canEdit ? (
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={
            on
              ? `${person.called} is in your book. Tap to sit them out.`
              : `${person.called} is sitting out. Tap to put them back.`
          }
          disabled={flipping}
          className="family-switch"
          onClick={() => onFlip(!on)}
        >
          <span className="family-switch-track" aria-hidden="true">
            <span className="family-switch-knob" />
          </span>
          <span className="family-switch-words">
            {on ? "In the book" : "Sitting out"}
          </span>
        </button>
      ) : null}
    </li>
  );
}

export function FamilyBook() {
  const { mine, canInvite } = useFamily();
  const view = useCookbookView();
  const createInvite = useMutation(api.kitchens.createInvite);
  const setIncluded = useMutation(api.connections.setIncluded);
  const plantFamily = useMutation(api.seedFamily.intoMyBook);
  const toast = useToast();
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [planting, setPlanting] = useState(false);
  const [flipping, setFlipping] = useState<string | null>(null);

  if (!mine) {
    return <p role="status">Opening your book…</p>;
  }

  const people = collapsePeople(view.family);
  const kitchenId = mine._id;

  async function copyLink() {
    setPending(true);
    try {
      const result = await createInvite({ kitchenId, role: "cook" });
      const url = `${window.location.origin}/join?invite=${encodeURIComponent(result.token)}`;
      setInviteUrl(url);
      const ok = await copyText(url);
      if (ok) {
        toast.success("Share link copied.");
      } else {
        toast.error("Clipboard blocked — select the link below and copy it.");
      }
    } catch (caught: unknown) {
      toast.error(caught instanceof Error ? caught.message : "Couldn’t make a link.");
    } finally {
      setPending(false);
    }
  }

  async function fillSample() {
    setPlanting(true);
    try {
      await plantFamily({});
      toast.success("Sample recipes added.");
    } catch (caught: unknown) {
      toast.error(caught instanceof Error ? caught.message : "Couldn’t fill it.");
    } finally {
      setPlanting(false);
    }
  }

  return (
    <div>
      <section className="mt-8">
        <h2 className="font-display text-[1.65rem] leading-8">Who&apos;s sharing</h2>
        {people.length === 0 && !view.peeking ? (
          <div className="mt-5">
            <p className="text-[19px] leading-8 text-ink-soft">
              Just you so far. Send a link when someone&apos;s ready to cook with
              you.
            </p>
            {import.meta.env.DEV ? (
              <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                <button
                  type="button"
                  className="inline-flex min-h-14 items-center underline decoration-cinnamon-deep underline-offset-[6px]"
                  disabled={planting}
                  onClick={() => void fillSample()}
                >
                  {planting ? "Adding sample recipes…" : "Put some family in"}
                </button>
              </p>
            ) : null}
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-rule/80">
            {people.map((person) => (
              <FamilyPerson
                key={person.otherUserId}
                person={person}
                canEdit={!view.peeking}
                flipping={flipping === person.otherUserId}
                onError={(message) => toast.error(message)}
                onFlip={(included) => {
                  setFlipping(person.otherUserId);
                  void setIncluded({
                    otherUserId: person.otherUserId,
                    included,
                  })
                    .catch((caught: unknown) => {
                      toast.error(
                        caught instanceof Error
                          ? caught.message
                          : "Couldn’t flip that.",
                      );
                    })
                    .finally(() => setFlipping(null));
                }}
              />
            ))}
          </ul>
        )}
      </section>

      {canInvite && !view.peeking ? (
        <section className="mt-14 pb-4">
          <Kicker>Share</Kicker>
          <h2 className="font-display mt-1 text-[1.65rem] leading-8">
            Invite someone
          </h2>
          <div className="mt-5 rounded-lg border border-rule border-l-[3px] border-l-cinnamon bg-paper-raised px-5 py-6 md:px-7 md:py-7">
            <p className="text-[18px] leading-8 text-ink-soft">
              {inviteUrl
                ? "Good for a month. Text it to them — when they sign in, you both show up in each other’s books."
                : "Send a link. They sign in with it, and you both show up in each other’s books."}
            </p>
            {inviteUrl ? (
              <p className="mt-5 break-all rounded-lg border border-dashed border-cocoa/35 bg-paper px-4 py-3 font-mono text-[15px] leading-6 text-ink">
                {inviteUrl}
              </p>
            ) : null}
            <button
              type="button"
              className="book-press book-press-text book-press-save mt-6 w-full sm:w-auto"
              disabled={pending}
              aria-busy={pending}
              onClick={() => void copyLink()}
            >
              {pending ? "Copying…" : inviteUrl ? "Copy it again" : "Copy a share link"}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
