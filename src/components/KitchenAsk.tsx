import { useAction } from "convex/react";
import { useId, useState, type FormEvent } from "react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Kicker } from "@/components/Kicker";
import { WhiskMark } from "@/components/WhiskMark";
import { useInkReveal } from "@/lib/useInkReveal";

export function KitchenAsk({
  title,
  sourceTitle,
  bakerName,
  outcome,
  changes,
}: {
  title: string;
  sourceTitle: string;
  bakerName: string;
  outcome: string;
  changes: Array<{ move: string; change: string; why: string }>;
}) {
  const remix = useAction(api.kitchen.remix);
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState<string | null>(null);
  const [letter, setLetter] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const headingId = useId();
  const statusId = useId();
  const noteId = useId();
  const revealed = useInkReveal(pending ? null : letter);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextQuestion = question.trim();
    const previous = letter;
    setError(null);
    setAsked(nextQuestion.length > 0 ? nextQuestion : "What would you change?");
    setLetter(null);
    setPending(true);
    const started = Date.now();
    try {
      const result = await remix({
        title,
        sourceTitle,
        bakerName,
        outcome,
        question: nextQuestion,
        priorNote: previous ?? undefined,
        changes,
      });
      const wait = 700 - (Date.now() - started);
      if (wait > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, wait));
      }
      setLetter(result.letter);
    } catch {
      setError("The kitchen went quiet. Try asking once more.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      className="mt-14 rounded-lg border border-rule border-l-[3px] border-l-cinnamon bg-paper-raised px-5 py-6"
      aria-labelledby={headingId}
    >
      <Kicker>If you&apos;re at the counter</Kicker>
      <h2 id={headingId} className="font-display mt-1 text-[1.65rem] leading-8">
        Missing something?
      </h2>
      <p className="mt-3 text-[18px] leading-7 text-ink-soft">
        Ask what you have — or don&apos;t. A note comes back for this bake,
        not a new recipe.
      </p>
      <form className="mt-5" onSubmit={(event) => void handleSubmit(event)}>
        <Label htmlFor="kitchen-ask">What&apos;s going on in your kitchen?</Label>
        <Textarea
          id="kitchen-ask"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="I don’t have pumpkin pie spice…"
          className="mt-2 min-h-28"
          aria-describedby={pending ? statusId : asked ? noteId : undefined}
        />
        <div className="mt-4">
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={pending}
            aria-busy={pending}
          >
            {pending ? "Looking through the notes…" : "Ask the kitchen"}
          </Button>
        </div>
      </form>

      {asked ? (
        <div id={noteId} className="mt-8">
          <p className="text-[16px] font-medium text-ink-soft">You asked</p>
          <p className="font-display mt-1 text-[1.35rem] leading-8 text-cocoa italic">
            “{asked}”
          </p>
          {pending ? (
            <p
              id={statusId}
              role="status"
              className="mt-5 flex items-center gap-3 text-[18px] text-ink-soft"
            >
              <WhiskMark className="kitchen-stir h-9 w-9 text-cinnamon-deep" />
              Looking through Mom&apos;s notes…
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="mt-5 text-[17px] text-cinnamon-deep">
              {error}
            </p>
          ) : null}
          {revealed ? (
            <aside
              className="kitchen-note mt-5 border-t border-rule pt-5"
              aria-live="polite"
            >
              <Kicker>A note back</Kicker>
              <div className="mt-3 flex flex-col gap-4">
                {revealed.split("\n").map((paragraph, index) =>
                  paragraph.trim().length > 0 ? (
                    <p
                      key={index}
                      className="kitchen-ink text-[18px] leading-7"
                    >
                      {paragraph}
                    </p>
                  ) : null,
                )}
              </div>
              <p className="font-display mt-5 text-[1.15rem] leading-7 text-cocoa italic">
                From the counter
              </p>
            </aside>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
