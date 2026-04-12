import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");

export const FLEXO_SETTINGS_PATH = join(DATA_DIR, "flexo-settings.json");
