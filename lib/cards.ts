import { readFileSync } from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { CATEGORY_IDS, type CategoryId } from "./categories";

export type Card = {
  id: string;
  image: string;
  category: CategoryId;
  message: string;
  alt: string;
};

const METADATA_BLOCK =
  /^---[ \t]*\r?\n((?:[A-Za-z][\w-]*:[^\r\n]*(?:\r?\n|$))+?)^---[ \t]*(?:\r?\n|$)/gm;

function isCategoryId(value: string): value is CategoryId {
  return (CATEGORY_IDS as readonly string[]).includes(value);
}

function firstHeadingText(message: string): string | undefined {
  const heading = message.match(/^#\s+(.+?)\s*#*\s*$/m)?.[1]?.trim();

  return heading || undefined;
}

function leadingHeadingText(message: string): string | undefined {
  const heading = message.match(/^#\s+(.+?)\s*#*\s*(?:\r?\n|$)/)?.[1]?.trim();

  return heading || undefined;
}

function stripInlineMarkdown(value: string): string {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .trim();
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function imageDetails(image: unknown, cardNumber: number) {
  if (typeof image !== "string" || !image.startsWith("imgs/")) {
    throw new Error(
      `Card ${cardNumber} has an invalid image. Expected a path under content/imgs/.`,
    );
  }

  const normalized = path.posix.normalize(image);
  if (!normalized.startsWith("imgs/") || normalized.includes("..")) {
    throw new Error(`Card ${cardNumber} image escapes content/imgs/: ${image}`);
  }

  const filename = path.posix.basename(normalized);

  return {
    altFromFilename: filename.replace(path.posix.extname(filename), ""),
    publicPath: `/content-imgs/${normalized.slice("imgs/".length)}`,
  };
}

export function parseCards(source: string): Card[] {
  const matches = Array.from(source.matchAll(METADATA_BLOCK));

  if (matches.length === 0) {
    throw new Error("No card metadata blocks found in content/card.md.");
  }

  const idCounts = new Map<string, number>();

  return matches.map((match, index) => {
    const cardNumber = index + 1;
    const messageStart = match.index + match[0].length;
    const messageEnd = matches[index + 1]?.index ?? source.length;
    const message = source.slice(messageStart, messageEnd).trim();
    const parsed = matter(`---\n${match[1]}---\n${message}`);
    const category = parsed.data.category;

    if (typeof category !== "string" || !isCategoryId(category)) {
      throw new Error(
        `Card ${cardNumber} has unknown category "${String(category)}". Expected one of: ${CATEGORY_IDS.join(", ")}.`,
      );
    }

    const { altFromFilename, publicPath } = imageDetails(
      parsed.data.image,
      cardNumber,
    );
    const firstHeading = firstHeadingText(message);
    const leadingHeading = leadingHeadingText(message);
    const baseId = firstHeading
      ? slugify(stripInlineMarkdown(firstHeading))
      : `card-${cardNumber}`;
    const idRoot = baseId || `card-${cardNumber}`;
    const duplicateNumber = (idCounts.get(idRoot) ?? 0) + 1;
    idCounts.set(idRoot, duplicateNumber);

    return {
      id: duplicateNumber === 1 ? idRoot : `${idRoot}-${duplicateNumber}`,
      image: publicPath,
      category,
      message,
      alt: leadingHeading
        ? stripInlineMarkdown(leadingHeading)
        : altFromFilename.replace(/[-_]+/g, " "),
    };
  });
}

export function shuffleCards(
  cards: readonly Card[],
  random: () => number = Math.random,
): Card[] {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export function getAllCards(): Card[] {
  const cardFile = path.join(process.cwd(), "content", "card.md");

  return parseCards(readFileSync(cardFile, "utf8"));
}
