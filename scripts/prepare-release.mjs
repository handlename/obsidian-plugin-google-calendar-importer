import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const RELEASE_DIR = "release";
const FILES_TO_COPY = ["main.js", "manifest.json", "styles.css"];

mkdirSync(RELEASE_DIR, { recursive: true });

for (const file of FILES_TO_COPY) {
	const src = join(process.cwd(), file);
	const dest = join(RELEASE_DIR, file);
	copyFileSync(src, dest);
	console.log(`Copied: ${file} -> ${RELEASE_DIR}/`);
}

console.log("\nRelease files prepared successfully!");
console.log("\nNext steps:");
console.log("1. Create a GitHub release with tag matching manifest.json version");
console.log("2. Upload files from release/ as release assets");
console.log(
	"3. Users can install via BRAT using: handlename/obsidian-plugin-google-calendar-importer",
);
