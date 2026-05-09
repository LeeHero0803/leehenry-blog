import type { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants";

export type SiteConfig = {
	title: string;
	subtitle: string;

	lang:
		| "en"
		| "zh_CN"
		| "zh_TW"
		| "ja"
		| "ko"
		| "es"
		| "th"
		| "vi"
		| "tr"
		| "id";

	theme: {
		default: LIGHT_DARK_MODE; // 首访默认主题
	};
	banner: {
		enable: boolean;
		src: string;
		srcLight?: string;
		position?: "top" | "center" | "bottom";
		credit: {
			enable: boolean;
			text: string;
			url?: string;
		};
		creditLight?: {
			text: string;
			url?: string;
		};
	};
	toc: {
		enable: boolean;
		depth: 1 | 2 | 3;
	};
	twikoo: {
		enable: boolean;
		envId: string;
		region?: string;
		lang?: string;
	};

	favicon: Favicon[];
};

export type Favicon = {
	src: string;
	theme?: "light" | "dark";
	sizes?: string;
};

export enum LinkPreset {
	Home = 0,
	Archive = 1,
	About = 2,
}

export type NavBarLink = {
	name: string;
	url: string;
	external?: boolean;
	icon?: string; // 新增
};

export type NavBarConfig = {
	links: (NavBarLink | LinkPreset)[];
	showHomeButton?: boolean; // 是否显示主页按钮（默认显示）
};

export type ProfileConfig = {
	avatar?: string;
	avatarLight?: string;
	name: string;
	bio?: string;
	useSignature?: boolean; // 是否使用签名图片替代文字名字
	signatureDark?: string; // 签名图片，需透明背景，相对于 /public 目录
	links: {
		name: string;
		url: string;
		icon: string;
		popup?: boolean;
		popupImage?: string;
		copyOnClick?: boolean;
	}[];
};

export type LicenseConfig = {
	enable: boolean;
	name: string;
	url: string;
};

export type LIGHT_DARK_MODE =
	| typeof LIGHT_MODE
	| typeof DARK_MODE
	| typeof AUTO_MODE;

export type BlogPostData = {
	body: string;
	title: string;
	published: Date;
	description: string;
	tags: string[];
	draft?: boolean;
	image?: string;
	category?: string;
	prevTitle?: string;
	prevSlug?: string;
	nextTitle?: string;
	nextSlug?: string;
};

export type ExpressiveCodeConfig = {
	theme: string;
};

export type TitleSplitConfig = {
	enable: boolean; // 是否启用标题分割功能
	opacity: number; // 后半部分的透明度 (0-1)
	// 首页特殊样式配置
	homePage: {
		showSuffix: boolean; // 是否显示副标题（后半部分）
		showOnHover: boolean; // 鼠标悬停时显示副标题
		hideSeparator: boolean; // 是否隐藏冒号
		suffixScale: number; // 后半部分的字体大小缩放比例 (0-1)
	};
	// 正文页特殊样式配置
	postPage: {
		suffixNewLine: boolean; // 后半部分是否换行显示
		suffixScale: number; // 后半部分的字体大小缩放比例 (0-1)
	};
};

export type PostMetaConfig = {
	showWordCount: boolean; // 是否显示字数统计
	showReadTime: boolean; // 是否显示阅读时间
};
