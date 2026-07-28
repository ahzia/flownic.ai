import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { blueprintSchema, type Blueprint } from "@/domain/blueprint/schema";

export const BLUEPRINT_SOURCE_PATH = resolve(
  process.cwd(),
  "content/blueprints/telc-de-b1-speaking/blueprint.json",
);

export function loadBlueprintFromDisk(
  path = BLUEPRINT_SOURCE_PATH,
): Blueprint {
  const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
  return blueprintSchema.parse(raw);
}

export function contentHash(blueprint: Blueprint): string {
  const canonical = JSON.stringify(blueprint);
  return createHash("sha256").update(canonical).digest("hex");
}

export function validateBlueprintFile(path = BLUEPRINT_SOURCE_PATH): {
  blueprint: Blueprint;
  hash: string;
} {
  const blueprint = loadBlueprintFromDisk(path);
  return { blueprint, hash: contentHash(blueprint) };
}
