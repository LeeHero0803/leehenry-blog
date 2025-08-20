import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "伏枥之间",
	subtitle: "WhistleWanderer",
	lang: "zh_CN", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 250, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
	},
	banner: {
		enable: true,
		src: "assets/images/demo-banner.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed
			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		// Leave this array empty to use the default favicon
		// {
		//   src: '/favicon/icon.png',    // Path of the favicon, relative to the /public directory
		//   theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
		//   sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		// }
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

export const navBarConfig = {
	links: [
		{ name: "首页", url: "/", icon: "fa6-solid:house" },
		{ name: "归档", url: "/archive/", icon: "fa6-solid:box-archive" },
		{ name: "关于", url: "/about/", icon: "fa6-solid:user" },
		{ name: "友链", url: "/friends/", icon: "fa6-solid:link" },
		{
			name: "GitHub",
			url: "https://github.com/LeeHero0803",
			external: true,
			icon: "fa6-brands:github",
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/Avatar-Cyan.jpg", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "伏枥 | Henry Lee",
	bio: "进一步有进一步的欢喜。",
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/LeeHero0803",
		},
		// {
		// 	name: "Twitter",
		// 	icon: "fa6-brands:twitter",
		// 	url: "https://twitter.com/yourname",
		// },
		// {
		// 	name: "知乎",
		// 	icon: "simple-icons:zhihu",
		// 	url: "https://www.zhihu.com/people/xxx",
		// },
		{
			name: "B站",
			icon: "simple-icons:bilibili",
			url: "https://space.bilibili.com/29402544",
		},
		{
			name: "微信",
			icon: "simple-icons:wechat",
			url: "#",
			popup: true,
			popupImage: "/wechat-qrcode.png",
		},
		{
			name: "邮箱",
			icon: "fa6-regular:envelope",
			url: "mailto:leehenry1024@qq.com",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
