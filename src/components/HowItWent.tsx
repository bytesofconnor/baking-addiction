import { useMutation, useQuery } from "convex/react";
import { useId, useState, type FormEvent } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatMadeAt, todayStamp } from "@/lib/dates";
import { useToast } from "@/lib/toast";

export function HowItWent({ bakeId }: { bakeId: Id<"bakes"> }) {
  const mine = useQuery(api.makes.forBake, { bakeId });
  const save = useMutation(api.makes.save);
  const [note, setNote] = useState("");
  const [madeOn, setMadeOn] = useState(todayStamp);
  const [pending, setPending] = useState(false);
  const headingId = useId();
  const toast = useToast();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      await save({ bakeId, note, madeOn });
      setNote("");
      setMadeOn(todayStamp());
      toast.success("Added to your page.");
    } catch (caught) {
      toast.error(
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
          {latest.note ? <p>{latest.note}</p> : null}
        </div>
      ) : null}

      <form className="how-it-went-form" onSubmit={(event) => void handleSubmit(event)}>
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
        <div>
          <Label htmlFor="how-it-went">A note, if you want</Label>
          <Textarea
            id="how-it-went"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="A little dry. Next time more oil…"
            className="mt-1 min-h-24"
            autoCapitalize="sentences"
            enterKeyHint="done"
          />
        </div>
        <div>
          <button
            type="submit"
            className="book-press book-press-text book-press-save"
            disabled={pending}
            aria-busy={pending}
          >
            {pending ? "Saving…" : "Jot it down"}
          </button>
        </div>
      </form>

    </section>
  );
}
