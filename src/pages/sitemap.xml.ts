import { getSortedPosts } from "@utils/content-utils";
import { getLegacyJekyllPaths } from "@utils/legacy-url-utils";
import type { APIRoute } from "astro";

function escapeXml(unsafe: string): string {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

export const GET: APIRoute = async ({ site }) => {
	const baseSite = site ? site.href.replace(/\/$/, "") : "https://jinkyeom.github.io";
	const posts = await getSortedPosts();
	const urls = new Map<string, string>();

	const today = new Date().toISOString();
	urls.set(`${baseSite}/`, today);
	urls.set(`${baseSite}/about/`, today);
	urls.set(`${baseSite}/archive/`, today);

	for (const post of posts) {
		const lastmod = new Date(
			post.data.updated || post.data.published,
		).toISOString();

		// Current Astro URL
		const astroUrl = new URL(`/posts/${post.slug}/`, `${baseSite}/`).href;
		urls.set(astroUrl, lastmod);

		// Legacy Jekyll URLs (so Google & Naver still recognize previously indexed paths)
		for (const legacyPath of getLegacyJekyllPaths(post)) {
			const encodedPath = legacyPath
				.split("/")
				.map((seg) => encodeURIComponent(seg))
				.join("/");
			const legacyUrl = `${baseSite}/${encodedPath}/`;
			if (!urls.has(legacyUrl)) {
				urls.set(legacyUrl, lastmod);
			}
		}
	}

	const urlEntries = Array.from(urls.entries())
		.map(
			([loc, lastmod]) =>
				`  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`,
		)
		.join("\n");

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

	return new Response(xml, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
		},
	});
};
