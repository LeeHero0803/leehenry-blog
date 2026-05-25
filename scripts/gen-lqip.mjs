import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { cached } from "./lib/image-cache.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Mirror paths from src/config.ts banner.src / banner.srcLight
const BANNERS = {
	dark: "src/assets/images/banner.webp",
	light: "src/assets/images/banner-light.gif",
};

const OUTPUT = path.join(root, "src/data/banner-lqip.json");

async function genLqip(rel) {
	const abs = path.join(root, rel);
	if (!fs.existsSync(abs)) return null;
	return await cached(abs, "banner-lqip", async () => {
		const buf = await sharp(abs, { pages: 1 })
			.resize(32)
			.webp({ quality: 20 })
			.toBuffer();
		return `data:image/webp;base64,${buf.toString("base64")}`;
	});
}

const dark = await genLqip(BANNERS.dark);
const light = await genLqip(BANNERS.light);

fs.writeFileSync(OUTPUT, JSON.stringify({ dark, light }, null, "\t"));
console.log(`✓ Generated banner LQIP`);
