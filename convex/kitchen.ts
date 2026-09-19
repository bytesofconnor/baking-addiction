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

export const remix = action({
  args: {
    title: v.string(),
    sourceTitle: v.string(),
    bakerName: v.string(),
    outcome: v.string(),
    question: v.string(),
    priorNote: v.optional(v.string()),
    changes: v.array(changeValidator),
  },
  returns: v.object({
    letter: v.string(),
  }),
  handler: async (_ctx, args) => {
    const question = args.question.trim();
    const notes = args.changes
      .filter((change) => change.move.trim().length > 0)
      .map(
        (change) =>
          `${change.move}: ${change.change}${change.why ? ` (${change.why})` : ""}`,
      )
      .join("\n");

    const apiKey = env.AI_GATEWAY_API_KEY?.trim();
    if (!apiKey) {
      return {
        letter: letterFromNotes({
          title: args.title,
          question,
          changes: args.changes,
        }),
      };
    }

    try {
      const gateway = createGateway({ apiKey });
      const { text } = await generateText({
        model: gateway("anthropic/claude-haiku-4.5"),
        instructions: [
          "You write short notes from Mom's kitchen counter for her family.",
          "Sally's Baking Addiction is the method. Mom's notes are the only changes.",
          "Stay on THIS bake. Do not invent a new recipe or send them to a different one.",
          "Warm, plain, specific. No bullet lists, no numbered lists, no markdown, no headings, no emojis.",
          "Two or three short paragraphs, like a note slipped into a recipe book.",
          "Do not sign the note.",
        ].join(" "),
        prompt: [
          `Bake: ${args.title}`,
          `Started from Sally's: ${args.sourceTitle}`,
          `Baker: ${args.bakerName}`,
          args.outcome ? `How it turned out: ${args.outcome}` : "",
          notes ? `Mom's changes:\n${notes}` : "Mom didn't write specific swaps.",
          args.priorNote
            ? `You already wrote them this note:\n${args.priorNote}`
            : "",
          `They asked: ${question.length > 0 ? question : "(nothing yet — offer one or two remix ideas from Mom's notes)"}`,
        ]
          .filter((line) => line.length > 0)
          .join("\n\n"),
        providerOptions: {
          gateway: {
            tags: ["feature:kitchen-remix"],
          },
        },
      });

      const letter = text.trim();
      if (letter.length === 0) {
        throw new Error("Empty kitchen note");
      }
      return { letter };
    } catch (error) {
      console.error("Kitchen remix failed", error);
      return {
        letter: letterFromNotes({
          title: args.title,
          question,
          changes: args.changes,
        }),
      };
    }
  },
});
