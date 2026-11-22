import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "바운스바운스",
	subtitle: "두근두근 콩닥콩닥 심쿵심쿵",
	lang: "ko",
	themeColor: {
		hue: 225,
		fixed: false,
	},
	banner: {
		enable: true,
		src: "/assets/images/bouncebounce-banner.webp",
		position: "center",
		credit: {
			enable: false,
			text: "",
			url: "",
		},
	},
	toc: {
		enable: true,
		depth: 2,
	},
	favicon: [],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		{
			name: "과학정류장",
			url: "https://sciencestop.kr/",
			external: true,
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "/assets/images/logo-blackhole-b-v2.png",
	name: "BounceBounce",
	bio: "끌릴 때 실컷 놀고, 안 땡길 땐 실컷 쉬고. 다시 통통 튀어 오르는 살아있는 기록, 바운스바운스(BounceBounce).",
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/jinkyeom",
		},
		{
			name: "과학정류장",
			icon: "fa6-solid:compass",
			url: "https://sciencestop.kr/",
		},
		{
			name: "Email",
			icon: "fa6-regular:envelope",
			url: "mailto:jinkyeom.kim@gmail.com",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	theme: "github-dark",
};
