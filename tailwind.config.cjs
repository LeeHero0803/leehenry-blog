/** @type {import('tailwindcss').Config} */

const EMOJI = ["Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji"];

module.exports = {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue,mjs}"],
	darkMode: "class",
	theme: {
		borderRadius: {
			none: "0",
			sm: "0",
			DEFAULT: "0",
			md: "0",
			lg: "0",
			xl: "0",
			"2xl": "0",
			"3xl": "0",
			full: "9999px",
		},
		extend: {
			fontFamily: {
				// emoji 字体放到字体栈最后：避免主字体 swap 期间 Segoe UI Emoji / Apple Color Emoji
				// 把 ASCII 数字/字母渲染成宽字距、有渐变的 emoji 风格。
				// 浏览器对 emoji 字符自带 fallback，不依赖 font-family 顺序。
				sans:  ["vivo Sans", "system-ui", "sans-serif", ...EMOJI],
				serif: ["Zhuque Fangsong", "STKaiti", "KaiTi", "serif", ...EMOJI],
				mono:  ["JetBrains Mono Variable", "vivo Sans", "ui-monospace", "monospace", ...EMOJI],
			},

		},
	},
	plugins: [require("@tailwindcss/typography")],
};
