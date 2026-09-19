"use node";

import { createGateway, generateText } from "ai";
import { v } from "convex/values";
import JSZip from "jszip";
import { action, env } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  cardFromText,
  cardsFromPages,
  parseCardsJson,
  type ExtractedCard,
} from "./lib/cardFromText";
import { sourceKindValidator } from "./lib/sources";

const cardFields = {
  title: v.string(),
  makes: v.string(),
  ingredients: v.array(v.string()),
  steps: v.array(v.string()),
  sourceKind: sourceKindValidator,
  sourceTitle: v.string(),
};

const extractReturn = v.object({
  cards: v.array(v.object(cardFields)),
  usedAi: v.boolean(),
  rawText: v.string(),
});

export const fromUpload = action({
  args: {
    writerToken: v.optional(v.string()),
    kitchenId: v.optional(v.id("kitchens")),
    storageId: v.id("_storage"),
    fileName: v.string(),
    mimeType: v.string(),
  },
  returns: extractReturn,
  handler: async (
    ctx,
    args,
  ): Promise<{ cards: ExtractedCard[]; usedAi: boolean; rawText: string }> => {
    await ctx.runQuery(internal.sallyCredit.assertWriter, {
      writerToken: args.writerToken,
      kitchenId: args.kitchenId,
    });

    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) {
      throw new Error("That file didn't stay. Try the upload once more.");
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Couldn't open that file.");
    }
    const bytes = await response.arrayBuffer();
    const mime = args.mimeType.toLowerCase();
    const isImage = mime.startsWith("image/");
    const pages = isImage
      ? []
      : await pagesFromFile(bytes, args.fileName, mime);
    const rawText = pages.join("\n\n---\n\n");

    const apiKey = env.AI_GATEWAY_API_KEY?.trim();
    if (apiKey) {
      try {
        const cards = await cardsWithAi({
          apiKey,
          pages,
          rawText,
          fileName: args.fileName,
          imageUrl: isImage ? url : null,
        });
        if (cards.length > 0) {
          return { cards, usedAi: true, rawText };
        }
      } catch (error) {
        console.error("Card extract failed", error);
      }
    }

    if (isImage) {
      return { cards: [emptyCard(args.fileName)], usedAi: false, rawText };
    }
    const fallback =
      pages.length > 1
        ? cardsFromPages(pages, args.fileName)
        : [cardFromText(rawText, args.fileName)];
    return { cards: fallback, usedAi: false, rawText };
  },
});

function emptyCard(fileName: string): ExtractedCard {
  return {
    title: fileName.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").trim(),
    makes: "",
    ingredients: [],
    steps: [],
    sourceKind: "original",
    sourceTitle: "",
  };
}

async function pagesFromFile(
  bytes: ArrayBuffer,
  fileName: string,
  mime: string,
): Promise<string[]> {
  const name = fileName.toLowerCase();
  if (name.endsWith(".pptx") || mime.includes("presentationml")) {
    return await textFromPptx(bytes);
  }
  const asText = new TextDecoder().decode(bytes);
  if (asText.includes("%PDF")) {
    return [];
  }
  return splitPlainPages(asText.slice(0, 40_000));
}

function splitPlainPages(raw: string): string[] {
  const chunks = raw
    .split(/\n{3,}|^---+$/m)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);
  return chunks.length > 0 ? chunks : [raw.trim()].filter(Boolean);
}

async function textFromPptx(bytes: ArrayBuffer): Promise<string[]> {
  const zip = await JSZip.loadAsync(bytes);
  const slides = Object.keys(zip.files)
    .filter((path) => /ppt\/slides\/slide\d+\.xml$/i.test(path))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
  const pages: string[] = [];
  for (const path of slides) {
    const xml = await zip.file(path)?.async("string");
    if (!xml) {
      continue;
    }
    const bits = [...xml.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map((match) =>
      match[1]?.trim() ?? "",
    );
    const page = bits.filter((bit) => bit.length > 0).join("\n");
    if (page.length > 0) {
      pages.push(page);
    }
  }
  return pages;
}

async function cardsWithAi({
  apiKey,
  pages,
  rawText,
  fileName,
  imageUrl,
}: {
  apiKey: string;
  pages: string[];
  rawText: string;
  fileName: string;
  imageUrl: string | null;
}): Promise<ExtractedCard[]> {
  const gateway = createGateway({ apiKey });
  const slideBlock =
    pages.length > 1
      ? pages
          .map((page, index) => `--- Slide ${index + 1} ---\n${page}`)
          .join("\n\n")
          .slice(0, 36_000)
      : rawText.slice(0, 36_000);
  const instructions = [
    "Extract every distinct home-cook recipe card from this private family recipe book file.",
    "A PowerPoint or packet may have many recipes — one card per recipe, not one mashed card.",
    "Skip title slides, indexes, photo-only pages, and leftover notes that are not a recipe.",
    "Return ONLY JSON: {cards:[{title, makes, ingredients: string[], steps: string[], sourceKind, sourceTitle}]}.",
    "Maximum 24 cards. ingredients and steps are short lines in the cook's words.",
    "sourceKind must be sally, original, family, friend, book, tiktok, or pinterest.",
    "Do not invent ingredients that are not in the file.",
    "If a page looks like a Sally's Baking Addiction printout, sourceKind is sally and sourceTitle is her recipe name. Do not copy long Sally prose — short family lines only.",
    "If it is a handwritten or typed family card, sourceKind is family. If a friend sent it, friend. If it is from another cookbook, book. TikTok or Pinterest if that is clear.",
    "Otherwise original.",
  ].join(" ");

  const content: Array<
    { type: "text"; text: string } | { type: "image"; image: URL }
  > = [
    {
      type: "text",
      text: [
        instructions,
        `File name: ${fileName}`,
        slideBlock ? `Text from the file:\n${slideBlock}` : "",
      ]
        .filter((line) => line.length > 0)
        .join("\n\n"),
    },
  ];
  if (imageUrl) {
    content.push({ type: "image", image: new URL(imageUrl) });
  }

  const { text } = await generateText({
    model: gateway("anthropic/claude-haiku-4.5"),
    messages: [{ role: "user", content }],
    providerOptions: {
      gateway: {
        tags: ["feature:card-extract"],
      },
    },
  });

  return parseCardsJson(text);
}
