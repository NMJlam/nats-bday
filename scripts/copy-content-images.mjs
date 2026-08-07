import { cp, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";

const source = path.join(process.cwd(), "content", "imgs");
const destination = path.join(process.cwd(), "public", "content-imgs");

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });

const entries = await readdir(source, { withFileTypes: true });

await Promise.all(
  entries.map((entry) =>
    cp(path.join(source, entry.name), path.join(destination, entry.name), {
      recursive: entry.isDirectory(),
    }),
  ),
);

console.log(`Copied ${entries.length} content asset${entries.length === 1 ? "" : "s"}.`);
