import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { visit } from "unist-util-visit";

export function rehypeImageLqip() {
	return async (tree, file) => {
		const markdownDir = file?.path ? path.dirname(file.path) : null;
		if (!markdownDir) return;

		const tasks = [];

		visit(tree, "element", (node) => {
			if (node.tagName !== "img") return;
			const src = node.properties?.src;
			if (!src) return;
			if (
				src.startsWith("http") ||
				src.startsWith("/") ||
				src.startsWith("data:")
			)
				return;

			tasks.push(async () => {
				const filePath = path.resolve(markdownDir, src);
				if (!fs.existsSync(filePath)) return;
				try {
					const data = await sharp(filePath)
						.resize(20, null, { withoutEnlargement: true })
						.jpeg({ quality: 60 })
						.toBuffer();
					node.properties["data-lqip"] =
						`data:image/jpeg;base64,${data.toString("base64")}`;
				} catch {
					// Unsupported format or corrupt file — skip silently
				}
			});
		});

		await Promise.all(tasks.map((t) => t()));
	};
}
