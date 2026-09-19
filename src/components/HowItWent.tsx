import { useMutation, useQuery } from "convex/react";
import { useId, useState, type FormEvent } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { BakeStars } from "@/components/BakeStars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatMadeAt, todayStamp } from "@/lib/dates";

export function HowItWent({ bakeId }: { bakeId: Id<"bakes"> }) {
  const mine = useQuery(api.makes.forBake, { bakeId });
  const save = useMutation(api.makes.save);
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState("");
  const [madeOn, setMadeOn] = useState(todayStamp);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const headingId = useId();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (rating < 1) {
      setError("Tap a star.");
      return;
    }
    setError(null);
    setSaved(false);
    setPending(true);
    try {
      await save({ bakeId, rating, note, madeOn });
      setRating(0);
      setNote("");
      setMadeOn(todayStamp());
      setSaved(true);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Couldn’t save that. Try once more.",
      );
    } finally {
      setPending(false);
    }
  }

  const latest = mine?.latest ?? null;

  return (
    <section
      className="how-it-went"
      aria-labelledby={headingId}
    >
      <h2 id={headingId} className="how-it-went-ask">
        {latest ? "How’d it go this time?" : "Did you try it?"}
      </h2>

      {latest ? (
        <div className="how-it-went-last">
          <p>Last time · {formatMadeAt(latest.madeAt)}</p>
          <BakeStars value={latest.rating} size="card" />
          {latest.note ? <p>{latest.note}</p> : null}
        </div>
      ) : null}

      <form className="how-it-went-form" onSubmit={(event) => void handleSubmit(event)}>
        <BakeStars
          value={rating}
          onChange={setRating}
          labelledBy={headingId}
          size="try"
        />
        <div className="how-it-went-when">
          <Label htmlFor="tried-on">When</Label>
          <Input
            id="tried-on"
            type="date"
            value={madeOn}
            max={todayStamp()}
            onChange={(event) => setMadeOn(event.target.value)}
            className="mt-1 max-w-[16rem] min-h-14"
          />
        </div>
        <Textarea
          id="how-it-went"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="A little dry. Next time more oil…"
          className="min-h-24"
        />
        <div>
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={pending || rating < 1}
            aria-busy={pending}
          >
            {pending ? "Saving…" : "Jot it down"}
          </Button>
        </div>
      </form>

      {error ? (
        <p role="alert" className="mt-4 text-[17px] text-cinnamon-deep">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p role="status" className="mt-4 text-[17px] text-ink-soft">
          On your page.
        </p>
      ) : null}
    </section>
  );
}
