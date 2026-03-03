import type { TSiteData, TtwitterMetaData, TMetadataIcons } from "@/types";

// edit the webmanifest file in /public to change the name, short_name, and icons in android
// in webmanifest, theme_color is the color of the app icon's background and
export const siteData: TSiteData = {
	favicon: "/favicon.svg", // .svg / .ico / .png
	name: "wplink - Whatsapp Link Generator",
	shortName: "wplink",
	publisher: "wplink.ardzero.com",
	baseUrl: import.meta.env.SITE, // make sure to change the link in astro.config.mjs 
	description:
		"Whatsapp Link Generator is a tool that auto generates whatsapp link and direct contact save link from a phone number",
	ogImage: { src: "/ogImage.webp", alt: "Whatsapp Link Generator", width: 1200, height: 630 },
	metadata_color: {
		light: "#1DAA61",
		dark: "#1DAA61",
	},
	author: {
		name: "Ard Astroid",
		url: "https://github.com/ardzero/",
	},
	keywords: [
		"whatsapp",
		"whatsapp link",
		"link generator",
		"contact link",
		"wa.me",
		"direct message",
		"messaging tool",
		"auto generate links",
		"chat link maker",
		"whatsapp api",
		"save to contacts",
		"phone number link",
		"click to chat",
		"whatsapp automation",
		"create whatsapp link"
	],

	robotsDefault: { index: true, follow: false }, // { index: false, follow: false }
};

// these are defaults may get overwrited in specific routes
export const twitterMetaData: TtwitterMetaData = {
	card: "summary_large_image",
	title: siteData.name,
	description: siteData.description,
	image: siteData.ogImage.src,
	creator: "@ardastroid", //twitter username of author
};

// By default, it uses the favicon mentioned at the top
export const icons: TMetadataIcons = {
	icon: siteData.favicon, // "/favicon.svg",
	shortcut: siteData.favicon, // "/favicon-16x16.png",
	apple: siteData.favicon, // "/apple-touch-icon.png",
};
