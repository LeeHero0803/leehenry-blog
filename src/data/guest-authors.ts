/**
 * 客邸作者元信息
 *
 * key 用小写（Astro 5 默认会把 content collection slug 全部小写化，
 * 所以这里的 key 与 src/content/guests/<folder>/ 文件夹名的小写形式对应）。
 * `name` 字段保留你想要的显示形式（XG7 / Tincts）。
 *
 * 未在此处登记的作者会回退到 { name: <folder>, signature: "", avatar: undefined }，
 * 此时头像将渲染为带首字母的色块占位。
 *
 * avatar 字段：以 `/` 开头则相对于 public 目录；否则相对于 src/。
 */

export interface GuestAuthor {
	name: string;
	signature?: string;
	avatar?: string;
	link?: string;
}

export const guestAuthors: Record<string, GuestAuthor> = {
	xg7: {
		name: "XG7",
		signature: "我会把自己送给你亲爱的。",
		avatar: "/friends/xg7.jpg",
		link: "https://xhslink.com/m/3jPYFUsqWea",
	},
	tincts: {
		name: "Tincts",
		signature: "恍惚地经历世界，笔直地面对自己。",
		avatar: "/friends/tincts.jpg",
		link: "https://v.douyin.com/cHLG7CGJdro/",
	},
};

export function getGuestAuthor(folderName: string): GuestAuthor {
	const key = folderName.toLowerCase();
	return guestAuthors[key] ?? { name: folderName };
}
