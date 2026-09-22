"use node";

import { createGateway, generateText } from "ai";
import { v } from "convex/values";
import { action, env } from "./_generated/server";
import { letterFromNotes } from "./lib/kitchenLetter";

const changeValidator = v.object({
  move: v.string(),
  change: v.string(),
  why: v.string(),
});

/** Free-tier friendly primary; paid models as fallbacks when credits exist. */
const KITCHEN_MODEL = "google/gemini-2.5-flash-lite";
const KITCHEN_FALLBACKS = [
  "openai/gpt-4o-mini",
  "anthropic/claude-haiku-4.5",
] as const;

export const remix = action({
  args: {
    title: v.string(),
    sourceTitle: v.string(),
    bakerName: v.string(),
    outcome: v.string(),
    question: v.string(),
    priorNote: v.optional(v.string()),
    changes: v.array(changeValidator),
    ingredients: v.optional(v.array(v.string())),
    steps: v.optional(v.array(v.string())),
  },
  returns: v.object({
    letter: v.string(),
  }),
  handler: async (_ctx, args) => {
    const question = args.question.trim();
    const baker = args.bakerName.trim() || "this kitchen";
    const notes = args.changes
      .filter((change) => change.move.trim().length > 0)
      .map(
        (change) =>
          `${change.move}: ${change.change}${change.why ? ` (${change.why})` : ""}`,
      )
      .join("\n");
    const ingredients = (args.ingredients ?? [])
      .map((line) => line.trim())
      .filter(Boolean);
    const steps = (args.steps ?? []).map((line) => line.trim()).filter(Boolean);

    const apiKey = (
      env.AI_GATEWAY_API_KEY ?? process.env.AI_GATEWAY_API_KEY
    )?.trim();
    if (!apiKey) {
      console.warn("Kitchen remix: AI_GATEWAY_API_KEY missing; using notes.");
      return {
        letter: letterFromNotes({
          title: args.title,
          question,
          changes: args.changes,
          bakerName: baker,
        }),
      };
    }

    try {
      const gateway = createGateway({ apiKey });
      const sourceLine = args.sourceTitle.trim()
        ? `Started from: ${args.sourceTitle.trim()}`
        : "Started from this kitchen.";
      const { text } = await generateText({
        model: gateway(KITCHEN_MODEL),
        instructions: [
          `You write short notes from ${baker}'s kitchen counter for their family recipe book.`,
          `This bake belongs to ${baker}. Always name them as ${baker} — never call them Mom, Mom, Mom, or Sally unless that is literally their name on this bake.`,
          "Use they/them for the baker.",
          "Answer the cook's question directly with a concrete swap or omission for THIS bake.",
          "If they are missing an ingredient, say what to use instead (or how to leave it out) and how it changes the dish.",
          "Never tell them to ask again or to name the missing thing if they already did.",
          "Stay on THIS bake. Do not invent a new recipe or send them to a different one.",
          "Warm, plain, specific. No bullet lists, no numbered lists, no markdown, no headings, no emojis.",
          "Two short paragraphs, like a note slipped into a recipe book.",
          "Do not sign the note.",
        ].join(" "),
        prompt: [
          `Bake: ${args.title}`,
          sourceLine,
          `Baker (the person who posted this recipe): ${baker}`,
          args.outcome ? `How it turned out: ${args.outcome}` : "",
          ingredients.length > 0
            ? `What went in:\n${ingredients.map((line) => `- ${line}`).join("\n")}`
            : "",
          steps.length > 0
            ? `How:\n${steps.map((line, i) => `${i + 1}. ${line}`).join("\n")}`
            : "",
          notes
            ? `${baker}'s changes:\n${notes}`
            : `${baker} didn't write specific swaps.`,
          args.priorNote
            ? `You already wrote them this note:\n${args.priorNote}`
            : "",
          `They asked: ${question.length > 0 ? question : `(nothing yet — offer one concrete remix idea from ${baker}'s notes)`}`,
        ]
          .filter((line) => line.length > 0)
          .join("\n\n"),
        providerOptions: {
          gateway: {
            tags: ["feature:kitchen-remix"],
            models: [...KITCHEN_FALLBACKS],
          },
        },
      });

      const letter = text.trim();
      if (letter.length === 0) {
        throw new Error("Empty kitchen note");
      }
      return { letter };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Kitchen remix failed", message);
      return {
        letter: letterFromNotes({
          title: args.title,
          question,
          changes: args.changes,
          bakerName: baker,
        }),
      };
    }
  },
});
