import { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants.ts";
import { siteConfig } from "@/config";
import type { LIGHT_DARK_MODE } from "@/types/config";

export function applyThemeToDocument(theme: LIGHT_DARK_MODE) {
	switch (theme) {
		case LIGHT_MODE:
			document.documentElement.classList.remove("dark");
			break;
		case DARK_MODE:
			document.documentElement.classList.add("dark");
			break;
		case AUTO_MODE:
			if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
				document.documentElement.classList.add("dark");
			} else {
				document.documentElement.classList.remove("dark");
			}
			break;
	}
}

export function setTheme(theme: LIGHT_DARK_MODE): void {
	localStorage.setItem("theme", theme);
	applyThemeToDocument(theme);
}

export function getStoredTheme(): LIGHT_DARK_MODE {
	const stored = localStorage.getItem("theme") as LIGHT_DARK_MODE | null;
	return stored ?? siteConfig.theme.default;
}
