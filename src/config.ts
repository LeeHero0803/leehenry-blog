import { DARK_MODE } from "./constants/constants";
import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	PostMetaConfig,
	ProfileConfig,
	SiteConfig,
	TitleSplitConfig,
} from "./types/config";

export const siteConfig: SiteConfig = {
	title: "伏枥之间",
	subtitle: "WhistleWanderer",
	lang: "zh_CN", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	theme: {
		default: DARK_MODE, // 首访默认主题（无 localStorage 时）：'light' | 'dark' | 'auto'
	},
	banner: {
		enable: true,
		src: "assets/images/banner.webp", // dark mode banner (or default). Relative to /src, or /public if starts with '/'
		srcLight: "assets/images/banner-light.gif", // light mode banner (optional)
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: true, // Display the credit text of the banner image
			text: "Dean Johns", // Credit text to be displayed (dark mode)
			url: "https://www.behance.net/gallery/136096999/Jpeg-Hunting/modules/769956589", // (Optional) URL link to the original artwork or artist's page
		},
		creditLight: {
			text: "Dean Johns", // Credit text for light mode banner
			url: "https://www.behance.net/gallery/134625455/Kodak-and-the-Ruins-of-Altmerta/modules/761835293",
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	twikoo: {
		enable: true, // Enable Twikoo comment system
		envId: "https://twikoo.leehenry.top/", // Replace with your Vercel deployment URL
		region: "", // Optional: Twikoo region (留空即可)
		lang: "zh-CN", // Language for Twikoo
	},
	favicon: [
		// Leave this array empty to use the default favicon
		{
			// 放在 /public 根目录，这样编译到 dist 时会出现在根目录
			src: "/favicon.ico", // Path of the favicon, relative to the /public directory
			//   theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
			//   sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		},
	],
};

// export const navBarConfig = {
// 	links: [
// 		LinkPreset.Home,
// 		LinkPreset.Archive,
// 		LinkPreset.About,
// 		{ name: "友链", url: "/friends/" }, // 新增
// 		{
// 			name: "GitHub",
// 			url: "https://github.com/LeeHero0803",
// 			external: true,
// 		},
// 	],
// };

export const navBarConfig: NavBarConfig = {
	showHomeButton: false, // 是否显示主页按钮（与左上角网站标题功能重复，默认false不显示）
	links: [
		{ name: "初见", url: "/", icon: "material-symbols:house-sharp" },
		{ name: "旧简", url: "/archive/", icon: "archive" },
		{ name: "光影", url: "/gallery/", icon: "camera" },
		{ name: "留心", url: "/guestbook/", icon: "mail" },
		{ name: "客邸", url: "/guests/", icon: "quote" },
		{ name: "友邻", url: "/friends/", icon: "smile" },
		{ name: "一隅", url: "/about/", icon: "anchor" },
		{
			name: "开往",
			url: "https://www.travellings.cn/train.html",
			external: true,
			icon: "arcadestick",
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "/friends/my-avatar-portrait.jpg", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	avatarLight: "/friends/my-avatar-portrait-light.jpg", // 亮色模式头像
	name: "伏枥",
	bio: "别让今天叫住我了",
	useSignature: true, // 是否使用签名图片替代文字名字
	signatureDark: "/signature.webp", // 签名图片（需透明背景）
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github-alt",
			url: "https://github.com/LeeHero0803",
		},
		{
			name: "Mastodon",
			icon: "fa6-brands:mastodon",
			url: "https://c7.io/@LeeHenry",
		},
		{
			name: "WeChat",
			icon: "fa6-brands:weixin",
			url: "#",
			popup: true,
			popupImage: "/wechat-qrcode.png",
		},
		{
			name: "Email",
			icon: "material-symbols:mail-sharp",
			url: "mailto:leehenry1024@qq.com",
		},
		{
			name: "RSS",
			icon: "material-symbols:rss-feed-sharp",
			url: "https://leehenry.top/rss.xml",
			copyOnClick: true,
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};

export const titleSplitConfig: TitleSplitConfig = {
	enable: true, // 启用标题分割功能（将"AAA：BBBBB"格式的标题，冒号后部分设为细体+半透明）
	opacity: 0.8, // 后半部分的透明度，0.8 表示 80% 透明度
	// 首页特殊样式配置
	homePage: {
		showSuffix: false, // 不显示副标题（后半部分）
		showOnHover: false, // 鼠标悬停时显示副标题
		hideSeparator: true, // 隐藏冒号
		suffixScale: 0.7, // 后半部分字体大小为原来的 80%
	},
	// 正文页特殊样式配置
	postPage: {
		suffixNewLine: true, // 后半部分换行显示
		suffixScale: 0.7, // 后半部分字体大小为原来的 80%
	},
};

export const postMetaConfig: PostMetaConfig = {
	showWordCount: false, // 不显示字数统计
	showReadTime: false, // 不显示阅读时间
};
