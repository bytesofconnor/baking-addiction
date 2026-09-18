import { useMutation, useQuery } from "convex/react";
import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Kicker } from "@/components/Kicker";
import { WhiskMark } from "@/components/WhiskMark";
import { formatBakeDate } from "@/lib/dates";
import { PageTitle } from "@/lib/pageTitle";
import { BAKER_NAME, SITE_SHORT } from "@/lib/site";
import { useWriter } from "@/lib/writer";
import { KINDS, KIND_LABELS, type BakeKind } from "../../convex/lib/kinds";

type ChangeRow = { move: string; change: string; why: string };

const emptyChange = (): ChangeRow => ({ move: "", change: "", why: "" });

export function WritePage() {
  const { status, token, unlock, lock } = useWriter();
  const [params, setParams] = useSearchParams();
  const [linkCode] = useState(() => params.get("code")?.trim() ?? "");
  const [openingLink, setOpeningLink] = useState(() => linkCode.length > 0);
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
    if (!params.has("code")) {
      return;
    }
    const next = new URLSearchParams(params);
    next.delete("code");
    setParams(next, { replace: true });
  }, [params, setParams]);

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

function WriteDesk({
  token,
  onLock,
}: {
  token: string;
  onLock: () => Promise<void>;
}) {
  const saveBake = useMutation(api.bakes.save);
  const generateUploadUrl = useMutation(api.photos.generateUploadUrl);
  const attachPhoto = useMutation(api.photos.attach);
  const mine = useQuery(
    api.bakes.listMine,
    token ? { writerToken: token } : "skip",
  );
  const navigate = useNavigate();
  const formErrorId = useId();

  const [title, setTitle] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [story, setStory] = useState("");
  const [bakerName, setBakerName] = useState(BAKER_NAME);
  const [bakedOn, setBakedOn] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [outcome, setOutcome] = useState("");
  const [changes, setChanges] = useState<ChangeRow[]>([emptyChange()]);
  const [kind, setKind] = useState<BakeKind>("other");
  const [method, setMethod] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [photoFile]);

  function updateChange(index: number, field: keyof ChangeRow, value: string) {
    setChanges((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    );
  }

  async function onSubmit(status: "draft" | "published") {
    setError(null);
    setStatusMessage(null);
    if (status === "published" && !photoFile) {
      setError("Add a photo of what came out. That's what family sees first.");
      return;
    }
    setPending(true);
    try {
      const result = await saveBake({
        writerToken: token,
        title,
        story,
        sourceTitle,
        sourceUrl,
        bakerName,
        kind,
        method,
        bakedOn,
        rating: 5,
        outcome,
        changes,
        status,
      });
      if (photoFile) {
        await uploadPhoto(result.bakeId, photoFile, title);
      }
      if (status === "published") {
        navigate(`/bakes/${result.slug}`);
      } else {
        setStatusMessage("Saved as a draft. You can come back to it later.");
        setTitle("");
        setStory("");
        setMethod("");
        setPhotoFile(null);
        setChanges([emptyChange()]);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save");
    } finally {
      setPending(false);
    }
  }

  async function uploadPhoto(
    bakeId: Id<"bakes">,
    file: File,
    alt: string,
  ) {
    const uploadUrl = await generateUploadUrl({ writerToken: token });
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!response.ok) {
      throw new Error("Photo upload failed");
    }
    const { storageId } = (await response.json()) as {
      storageId: Id<"_storage">;
    };
    await attachPhoto({
      writerToken: token,
      bakeId,
      storageId,
      alt,
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void onSubmit("published");
  }

  return (
    <div>
      <PageTitle title={`Write · ${SITE_SHORT}`} />
      <form
        className="flex flex-col"
        onSubmit={handleSubmit}
        aria-describedby={error ? formErrorId : undefined}
      >
        <Kicker>A letter from the kitchen</Kicker>
        <Label htmlFor="bake-title" className="mt-4">
          What did you call it?
        </Label>
        <input
          id="bake-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Pumpkin muffins, extra spice"
          required
          className="font-display mt-2 w-full rounded-[2px] border-0 border-b-[1.5px] border-rule bg-transparent pb-2 text-[2.25rem] leading-[1.15] tracking-tight text-ink placeholder:text-ink-soft transition-colors duration-150 hover:border-cinnamon-deep"
        />

        <div className="mt-8">
          <Label htmlFor="photo">A photo of what came out</Label>
          <p className="mt-1 max-w-[36rem] text-[17px] leading-7 text-ink-soft">
            Family sees this first. One good shot of the pan is enough.
          </p>
          <Input
            id="photo"
            type="file"
            accept="image/*"
            onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
            className="mt-3 border-0 bg-transparent px-0"
          />
          {photoPreview ? (
            <img
              src={photoPreview}
              alt=""
              className="mt-4 aspect-[4/3] w-full max-w-[28rem] border border-rule object-cover"
            />
          ) : null}
        </div>

        <Label htmlFor="story" className="mt-8">
          How it went
        </Label>
        <Textarea
          id="story"
          value={story}
          onChange={(event) => setStory(event.target.value)}
          placeholder="Sunday morning, house already smelled like cinnamon…"
          required
          className="mt-2 border-0 bg-transparent px-0 py-0"
        />

        <section
          aria-labelledby="write-sauce-heading"
          className="mt-10 border border-rule border-l-[3px] border-l-cinnamon bg-paper-raised px-5 py-5"
        >
          <Kicker>The secret sauce</Kicker>
          <h2 id="write-sauce-heading" className="font-display mt-1 text-[1.65rem] leading-8">
            What I changed
          </h2>
          <div className="mt-4 flex flex-col gap-8">
            {changes.map((change, index) => (
              <fieldset key={index} className="flex flex-col gap-3 border-0 p-0">
                <legend className="sr-only">Change {index + 1}</legend>
                <div>
                  <Label htmlFor={`change-move-${index}`}>
                    Ingredient or step
                  </Label>
                  <Input
                    id={`change-move-${index}`}
                    value={change.move}
                    onChange={(event) =>
                      updateChange(index, "move", event.target.value)
                    }
                    placeholder="Pumpkin pie spice"
                    className="mt-1 h-auto border-0 bg-transparent px-0 py-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`change-did-${index}`}>What you did instead</Label>
                  <Input
                    id={`change-did-${index}`}
                    value={change.change}
                    onChange={(event) =>
                      updateChange(index, "change", event.target.value)
                    }
                    placeholder="1 tsp → 2 tsp"
                    className="mt-1 h-auto border-0 bg-transparent px-0 py-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`change-why-${index}`}>Why</Label>
                  <Input
                    id={`change-why-${index}`}
                    value={change.why}
                    onChange={(event) =>
                      updateChange(index, "why", event.target.value)
                    }
                    placeholder="Our house likes it warmer."
                    className="mt-1 h-auto border-0 bg-transparent px-0 py-1"
                  />
                </div>
              </fieldset>
            ))}
          </div>
          <Button
            type="button"
            variant="secondary"
            className="mt-4 w-full sm:w-auto"
            onClick={() => setChanges((current) => [...current, emptyChange()])}
          >
            Add another change
          </Button>
        </section>

        <Label htmlFor="method" className="mt-10">
          How you made it, from this kitchen
        </Label>
        <p className="mt-1 max-w-[36rem] text-[17px] leading-7 text-ink-soft">
          Write it the way you actually baked it — pan, what went in, how long.
          This is your version, so family can cook from this page. Don&apos;t
          paste Sally&apos;s recipe; her link stays the credit.
        </p>
        <Textarea
          id="method"
          value={method}
          onChange={(event) => setMethod(event.target.value)}
          placeholder="One 9×13. Cut the filling sugar by a third. Extra handful of oats in the topping…"
          className="mt-2 border-0 bg-transparent px-0 py-0"
        />

        <div className="mt-10 flex flex-col gap-6">
          <Field label="Sally's recipe" htmlFor="sourceUrl">
            <Input
              id="sourceUrl"
              type="url"
              value={sourceUrl}
              onChange={(event) => setSourceUrl(event.target.value)}
              placeholder="https://sallysbakingaddiction.com/…"
              required
              className="border-0 border-b border-rule bg-transparent px-0"
            />
          </Field>
          <Field label="Her title for it" htmlFor="sourceTitle">
            <Input
              id="sourceTitle"
              value={sourceTitle}
              onChange={(event) => setSourceTitle(event.target.value)}
              placeholder="Pumpkin Crumb Cake Muffins"
              required
              className="border-0 border-b border-rule bg-transparent px-0"
            />
          </Field>
          <Field label="How it turned out" htmlFor="outcome">
            <Input
              id="outcome"
              value={outcome}
              onChange={(event) => setOutcome(event.target.value)}
              placeholder="Gone by noon. Doubled spice is the keeper."
              className="border-0 border-b border-rule bg-transparent px-0"
            />
          </Field>
          <Field label="Which tray" htmlFor="kind">
            <Select
              id="kind"
              value={kind}
              onChange={(event) => setKind(event.target.value as BakeKind)}
            >
              {KINDS.map((option) => (
                <option key={option} value={option}>
                  {KIND_LABELS[option]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Baked on" htmlFor="bakedOn">
            <Input
              id="bakedOn"
              type="date"
              value={bakedOn}
              onChange={(event) => setBakedOn(event.target.value)}
              required
              className="border-0 border-b border-rule bg-transparent px-0"
            />
          </Field>
          <Field label="Name on the post" htmlFor="bakerName">
            <Input
              id="bakerName"
              value={bakerName}
              onChange={(event) => setBakerName(event.target.value)}
              className="border-0 border-b border-rule bg-transparent px-0"
            />
          </Field>
        </div>

        {error ? (
          <p
            id={formErrorId}
            role="alert"
            className="mt-6 text-[17px] text-cinnamon-deep"
          >
            {error}
          </p>
        ) : null}
        {statusMessage ? (
          <p role="status" className="mt-6 text-[17px] text-ink-soft">
            {statusMessage}
          </p>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={pending} aria-busy={pending}>
            Publish
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => void onSubmit("draft")}
          >
            Save draft
          </Button>
        </div>
      </form>

      {mine && mine.length > 0 ? (
        <section
          className="mt-16 border-t border-rule pt-8"
          aria-labelledby="already-heading"
        >
          <Kicker>Already in the cookbook</Kicker>
          <h2 id="already-heading" className="sr-only">
            Bakes already in the cookbook
          </h2>
          <ul className="mt-4">
            {mine.map((bake) => (
              <li key={bake._id} className="border-t border-rule py-4">
                {bake.status === "published" ? (
                  <ButtonLink
                    to={`/bakes/${bake.slug}`}
                    variant="ghost"
                    className="font-display h-auto min-h-14 px-0 text-[1.35rem]"
                  >
                    {bake.title}
                  </ButtonLink>
                ) : (
                  <p className="font-display text-[1.35rem] text-ink-soft">
                    {bake.title}
                    <span className="ml-2 text-[17px] font-sans italic">
                      Draft
                    </span>
                  </p>
                )}
                <p className="text-[16px] text-ink-soft">
                  {bake.status === "draft"
                    ? "Saved, not published yet"
                    : formatBakeDate(bake.bakedOn)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Button
        type="button"
        variant="ghost"
        className="mt-10 px-0"
        onClick={() => {
          if (
            window.confirm(
              "Lock this device? You'll need the kitchen code again to write.",
            )
          ) {
            void onLock();
          }
        }}
      >
        Lock the kitchen
      </Button>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
