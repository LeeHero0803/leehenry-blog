// scripts/new-post.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 中文栏目 + 常用别名（小写）
const CATEGORIES = [
  { name: "野语不成篇", alias: ["wild", "yy", "WW"] },
  { name: "多懂一点点", alias: ["sense", "dd", "SS"] },
  { name: "我这样做事", alias: ["hack", "wz", "HT"] },
  { name: "瞬间备忘录", alias: ["moment", "sj", "MMs"] },
  { name: "话从哪说起", alias: ["mind", "hc", "MM"] },
];

function resolveCategory(input) {
  if (!input) return null;
  const hit = CATEGORIES.find(c => c.name === input.trim());
  if (hit) return hit.name;
  const key = input.trim().toLowerCase();
  for (const c of CATEGORIES) if (c.alias.includes(key)) return c.name;
  return null;
}

function today() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function titleFrom(slug) {
  return slug.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ").trim();
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: pnpm run new-post <category> <slug> [-t 'Title']");
  process.exit(1);
}

const categoryInput = args[0];
const slug = args[1].replace(/[\\/]+$/,"");
const tIdx = args.findIndex(a => a === "-t" || a === "--title");
const title = tIdx !== -1 ? args[tIdx + 1] : titleFrom(slug);

const category = resolveCategory(categoryInput);
if (!category) {
  console.error(`Error: Unknown category "${categoryInput}"`);
  process.exit(1);
}

const baseDir = path.join(__dirname, "..", "src", "content", "posts", category);
const imgDir = path.join(baseDir, slug);                 // 图片文件夹
const mdPath = path.join(baseDir, `${slug}.md`);         // 同名 Markdown

if (fs.existsSync(mdPath)) {
  console.error(`Error: File already exists: ${mdPath}`);
  process.exit(1);
}

fs.mkdirSync(imgDir, { recursive: true });

const fm = `---
title: ${title}
published: ${today()}
description: ''
image: ''
tags: []
category: ${category}
draft: false
lang: ''
---
`;

fs.writeFileSync(mdPath, fm, "utf8");

console.log(`Created post: ${mdPath}`);
console.log(`Created image dir: ${imgDir}`);
console.log(`Tip: 封面可放 ${path.join(imgDir, "cover.jpg")}，在 MD 里写 image: './${slug}/cover.jpg'`);
