import type { CollectionEntry } from "astro:content";
import { getGuestAuthorFromSlug } from "./content-utils";
import { getGuestPostUrlBySlug, getPostUrlBySlug } from "./url-utils";

/**
 * 系列标签：以 emoji 开头的 tag 即视为「系列」
 * 例：🗃️当月事 · ⏳又一年 · 💕呼唤爱 · 🔍找自己 · 🗺小行迹 · 🛒拾物语
 */
const SERIES_TAG_RE = /^\p{Extended_Pictographic}/u;

/** 在 tag 数组中找出第一个系列标签（emoji 开头的标签）；找不到返回 null。 */
export function findSeriesTag(
	tags: readonly string[] | undefined | null,
): string | null {
	if (!tags) return null;
	for (const t of tags) {
		if (SERIES_TAG_RE.test(t)) return t;
	}
	return null;
}

export interface SeriesPost {
	slug: string;
	title: string;
	published: Date;
	/** 已构建好的目标 URL —— 让组件不必关心来源 collection 是 posts 还是 guests */
	url: string;
}

/** 给定系列标签 + 全量已排序的正文文章，过滤出该系列下的所有文章（按发布时间正序）。 */
export function buildSeriesPosts(
	seriesTag: string,
	allPosts: CollectionEntry<"posts">[],
): SeriesPost[] {
	return allPosts
		.filter((p) => Array.isArray(p.data.tags) && p.data.tags.includes(seriesTag))
		.map((p) => ({
			slug: p.slug,
			title: p.data.title,
			published: p.data.published,
			url: getPostUrlBySlug(p.slug),
		}))
		.sort((a, b) => a.published.getTime() - b.published.getTime());
}

/** 给定客邸作者 key + 全量客邸文章，过滤出该作者的所有篇目（按发布时间正序）。 */
export function buildAuthorSeries(
	author: string,
	allGuestPosts: CollectionEntry<"guests">[],
): SeriesPost[] {
	return allGuestPosts
		.filter((p) => getGuestAuthorFromSlug(p.slug) === author)
		.map((p) => ({
			slug: p.slug,
			title: p.data.title,
			published: p.data.published,
			url: getGuestPostUrlBySlug(p.slug),
		}))
		.sort((a, b) => a.published.getTime() - b.published.getTime());
}
