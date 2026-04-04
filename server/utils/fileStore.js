import { readFileSync, writeFileSync, renameSync, mkdirSync } from "fs";
import { dirname } from "path";
import { randomBytes } from "crypto";

/**
 * Read JSON from a file. Returns parsed object.
 * Throws if file does not exist or JSON is invalid.
 */
export function readJson(filePath) {
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

/**
 * Write JSON to a file atomically (write to temp → rename).
 * Creates parent directory if needed.
 */
export function writeJson(filePath, data) {
  const dir = dirname(filePath);
  mkdirSync(dir, { recursive: true });

  const tmp = filePath + "." + randomBytes(4).toString("hex") + ".tmp";
  writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n", "utf-8");
  renameSync(tmp, filePath);
}
