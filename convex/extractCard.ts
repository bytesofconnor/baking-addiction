"use node";

import { createGateway, generateText } from "ai";
import { v } from "convex/values";
import JSZip from "jszip";
import { extractText, getDocumentProxy } from "unpdf";
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

/** Vision-capable free-tier models for recipe photos / scans. */
const EXTRACT_MODEL = "google/gemini-2.5-flash";
const EXTRACT_FALLBACKS = [
  "google/gemini-2.5-flash-lite",
  "openai/gpt-4o-mini",
] as const;

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
    const isPdf =
      mime.includes("pdf") ||
      args.fileName.toLowerCase().endsWith(".pdf") ||
      new TextDecoder().decode(bytes.slice(0, 5)).startsWith("%PDF");

    const pages = isImage
      ? []
      : isPdf
        ? await textFromPdf(bytes)
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
          imageBytes: isImage ? bytes : null,
          imageMime: isImage ? mime || "image/jpeg" : null,
        });
        if (cards.length > 0) {
          return { cards, usedAi: true, rawText };
        }
        console.warn("Card extract: AI returned no parseable cards");
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Card extract failed", message);
      }
    } else {
      console.warn("Card extract: AI_GATEWAY_API_KEY missing");
    }

    if (isImage) {
      return { cards: [emptyCard(args.fileName)], usedAi: false, rawText };
    }
    if (rawText.trim().length > 0) {
      const fallback =
        pages.length > 1
          ? cardsFromPages(pages, args.fileName)
          : [cardFromText(rawText, args.fileName)];
      return { cards: fallback, usedAi: false, rawText };
    }
    return { cards: [emptyCard(args.fileName)], usedAi: false, rawText };
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

async function textFromPdf(bytes: ArrayBuffer): Promise<string[]> {
  try {
    const pdf = await getDocumentProxy(new Uint8Array(bytes));
    const { text } = await extractText(pdf, { mergePages: false });
    const pages = (Array.isArray(text) ? text : [text])
      .map((page) => page.replace(/\s+\n/g, "\n").trim())
      .filter((page) => page.length > 0);
    if (pages.length > 0) {
      return pages;
    }
    const merged = await extractText(pdf, { mergePages: true });
    const blob = (Array.isArray(merged.text) ? merged.text.join("\n\n") : merged.text)
      .trim();
    return blob.length > 0 ? [blob.slice(0, 40_000)] : [];
  } catch (error) {
    console.error("PDF text extract failed", error);
    return [];
  }
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
    return await textFromPdf(bytes);
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
  imageBytes,
  imageMime,
}: {
  apiKey: string;
  pages: string[];
  rawText: string;
  fileName: string;
  imageBytes: ArrayBuffer | null;
  imageMime: string | null;
}): Promise<ExtractedCard[]> {
  const gateway = createGateway({ apiKey });
  const slideBlock =
    pages.length > 1
      ? pages
          .map((page, index) => `--- Page ${index + 1} ---\n${page}`)
          .join("\n\n")
          .slice(0, 36_000)
      : rawText.slice(0, 36_000);
  const hasImage = imageBytes !== null && imageBytes.byteLength > 0;
  const instructions = [
    "Extract every distinct home-cook recipe card from this private family recipe book file.",
    hasImage
      ? "This is a PHOTO or SCAN of a recipe card. Read the handwriting or print carefully. Pull title, yield, ingredients, and steps."
      : "A PDF, PowerPoint, or text packet may have many recipes — one card per recipe, not one mashed card.",
    "Skip title slides, indexes, photo-only pages with no recipe words, and leftover notes that are not a recipe.",
    "Return ONLY valid JSON (no markdown fences): {\"cards\":[{\"title\":\"\",\"makes\":\"\",\"ingredients\":[\"\"],\"steps\":[\"\"],\"sourceKind\":\"original\",\"sourceTitle\":\"\"}]}",
    "Maximum 24 cards. ingredients and steps are short lines in the cook's words.",
    "sourceKind must be sally, original, family, friend, book, tiktok, or pinterest.",
    "Do not invent ingredients that are not in the file or photo.",
    "If a page looks like a Sally's Baking Addiction printout, sourceKind is sally and sourceTitle is her recipe name. Do not copy long Sally prose — short family lines only.",
    "If it is a handwritten or typed family card, sourceKind is family. If a friend sent it, friend. If it is from another cookbook, book. TikTok or Pinterest if that is clear.",
    "Otherwise original.",
  ].join(" ");

  const content: Array<
    | { type: "text"; text: string }
    | { type: "image"; image: Uint8Array; mediaType?: string }
  > = [
    {
      type: "text",
      text: [
        instructions,
        `File name: ${fileName}`,
        slideBlock
          ? `Text from the file:\n${slideBlock}`
          : hasImage
            ? "No plain text was available — read the recipe from the image."
            : "No text was extracted from this file.",
      ]
        .filter((line) => line.length > 0)
        .join("\n\n"),
    },
  ];
  if (hasImage && imageBytes) {
    content.push({
      type: "image",
      image: new Uint8Array(imageBytes),
      mediaType: imageMime || "image/jpeg",
    });
  }

  const { text } = await generateText({
    model: gateway(EXTRACT_MODEL),
    messages: [{ role: "user", content }],
    providerOptions: {
      gateway: {
        tags: ["feature:card-extract"],
        models: [...EXTRACT_FALLBACKS],
      },
    },
  });

  return parseCardsJson(text);
}
