/**
 * 图片处理结果缓存：按 (filePath, mtime + size) 指纹命中，跳过 sharp/python 等昂贵处理。
 *
 * 缓存位置：node_modules/.cache/image-cache.json
 *   — node_modules 默认被 .gitignore 忽略，且 CI 通常会缓存这个目录
 *   — 文件损坏自动重置，不会让 build 挂掉
 *
 * 调用方式：
 *   await cached(filePath, "lqip", async () => { ... 昂贵计算 ... })
 *   返回的值会被写入 cache，下次同 path 同指纹直接复用
 *
 * 写盘策略：累积变更后由 process.on("exit") 一次性同步写出，避免每次写 IO。
 */
import fs from "node:fs";
import path from "node:path";

const CACHE_FILE = "node_modules/.cache/image-cache.json";

let _cache = null;
let _dirty = false;
let _exitHandlerRegistered = false;

function ensureExitHandler() {
	if (_exitHandlerRegistered) return;
	_exitHandlerRegistered = true;
	process.on("exit", flush);
}

function load() {
	if (_cache !== null) return _cache;
	ensureExitHandler();
	try {
		_cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
	} catch {
		_cache = {};
	}
	return _cache;
}

function fingerprint(filePath) {
	try {
		const s = fs.statSync(filePath);
		return `${s.mtimeMs}|${s.size}`;
	} catch {
		return null;
	}
}

/** 同步查缓存。命中返回值，否则返回 undefined。 */
export function getCached(filePath, key) {
	const cache = load();
	const fp = fingerprint(filePath);
	if (!fp) return undefined;
	const entry = cache[filePath];
	if (entry && entry.fp === fp && key in entry.values) {
		return entry.values[key];
	}
	return undefined;
}

/** 写缓存（同步，仅更新内存，待 flush 落盘）。 */
export function setCached(filePath, key, value) {
	const cache = load();
	const fp = fingerprint(filePath);
	if (!fp) return;
	if (!cache[filePath] || cache[filePath].fp !== fp) {
		cache[filePath] = { fp, values: {} };
	}
	cache[filePath].values[key] = value;
	_dirty = true;
}

/** cache-or-compute 便捷封装。 */
export async function cached(filePath, key, compute) {
	const v = getCached(filePath, key);
	if (v !== undefined) return v;
	const value = await compute();
	setCached(filePath, key, value);
	return value;
}

/** 把内存变更写到 cache 文件。脚本结束 / 进程 exit 时自动调用。 */
export function flush() {
	if (!_dirty || _cache === null) return;
	fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
	fs.writeFileSync(CACHE_FILE, JSON.stringify(_cache));
	_dirty = false;
}
