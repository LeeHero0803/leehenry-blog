import fs from "fs";
import os from "os";
import path from "path";
import { execSync } from "child_process";
import { getCached, setCached } from "./lib/image-cache.mjs";

const data = {
	categories: [
		{ id: "all", name: "一览" },
		{ id: "portrait", name: "特写 · 眉间心上" },
		{ id: "landscape", name: "沧海 · 大塊假我" },
		{ id: "street", name: "阡陌 · 人间烟火" },
		{ id: "still", name: "物语 · 惟石能言" },
	],
	images: [],
};

const dirs = ["portrait", "landscape", "street", "still"];
const allImages = [];

for (const dir of dirs) {
	const dirPath = `public/gallery/${dir}`;
	if (fs.existsSync(dirPath)) {
		fs.readdirSync(dirPath)
			.filter((f) => /\.(webp|jpg|jpeg|png|avif)$/i.test(f))
			.forEach((file) => {
				allImages.push({
					path: `${dirPath}/${file}`,
					src: `/gallery/${dir}/${file}`,
					category: dir,
				});
			});
	}
}

/** 用 sharp 批量读取图片尺寸（优先，Windows/Linux 原生环境均可用） */
async function getSizesViaSharp(paths) {
	const sharp = (await import("sharp")).default;
	const sizes = [];
	for (const p of paths) {
		try {
			const { width, height } = await sharp(p).metadata();
			sizes.push([width ?? 0, height ?? 0]);
		} catch {
			sizes.push([0, 0]);
		}
	}
	return sizes;
}

/** 用 Python Pillow 批量读取（回退方案，适用于 sharp 平台二进制不匹配时） */
function getSizesViaPython(paths) {
	// 用 os.tmpdir() 获取跨平台临时目录（Windows: C:\Users\...\AppData\Local\Temp）
	const tmpScript = path.join(os.tmpdir(), "_gallery_sizes.py");
	fs.writeFileSync(
		tmpScript,
		`import sys, json
from PIL import Image
paths = json.load(sys.stdin)
out = []
for p in paths:
    try:
        img = Image.open(p)
        out.append([img.width, img.height])
    except Exception:
        out.append([0, 0])
print(json.dumps(out))
`,
	);

	// 兼容 python3 / python 两种命令名
	const pythonCmd = ["python3", "python"].find((cmd) => {
		try {
			execSync(`${cmd} --version`, { stdio: "ignore" });
			return true;
		} catch {
			return false;
		}
	});
	if (!pythonCmd) throw new Error("找不到 Python，请确保已安装 Python 及 Pillow");

	const output = execSync(`${pythonCmd} "${tmpScript}"`, {
		input: JSON.stringify(paths),
		encoding: "utf8",
	});
	fs.unlinkSync(tmpScript);
	return JSON.parse(output.trim());
}

// 先查缓存（按 path + mtime + size 指纹）
const sizes = new Array(allImages.length);
const missIndices = [];
for (let i = 0; i < allImages.length; i++) {
	const hit = getCached(allImages[i].path, "size");
	if (hit) {
		sizes[i] = hit;
	} else {
		missIndices.push(i);
	}
}

// miss 的部分批量跑 sharp（失败再回退 Python）
if (missIndices.length > 0) {
	const missPaths = missIndices.map((i) => allImages[i].path);
	let missSizes;
	try {
		missSizes = await getSizesViaSharp(missPaths);
		console.log(
			`✓ 使用 sharp 读取 ${missPaths.length} 张图片尺寸（缓存命中 ${allImages.length - missPaths.length} 张）`,
		);
	} catch (e) {
		console.warn(`sharp 不可用 (${e.message})，回退到 Python Pillow...`);
		missSizes = getSizesViaPython(missPaths);
		console.log(
			`✓ 使用 Python Pillow 读取 ${missPaths.length} 张图片尺寸（缓存命中 ${allImages.length - missPaths.length} 张）`,
		);
	}
	missIndices.forEach((idx, j) => {
		sizes[idx] = missSizes[j];
		setCached(allImages[idx].path, "size", missSizes[j]);
	});
} else if (allImages.length > 0) {
	console.log(`✓ 全部 ${allImages.length} 张图片尺寸命中缓存`);
}

data.images = allImages.map((img, i) => ({
	src: img.src,
	category: img.category,
	w: sizes[i]?.[0] ?? 0,
	h: sizes[i]?.[1] ?? 0,
}));

fs.writeFileSync("src/data/gallery.json", JSON.stringify(data, null, "\t"));
console.log(`✓ 生成 gallery.json，共 ${data.images.length} 张图片`);
