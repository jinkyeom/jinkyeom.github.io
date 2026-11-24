import type { CollectionEntry } from "astro:content";

const CUSTOM_JEKYLL_PERMALINKS: Record<string, string> = {
	"2026-06-08-과학정류장-소개.md": "datascience/과학정류장-소개",
	"2026-07-14-sciencestop-series-02-departure.md": "sciencestop/series-02-departure",
	"2026-07-17-sciencestop-goedel-incompleteness-and-waiting.md": "sciencestop/goedel-incompleteness-and-waiting",
	"2026-07-25-sciencestop-darwin-tree-and-forest.md": "sciencestop/darwin-tree-and-forest",
};

export function getLegacyJekyllPaths(entry: CollectionEntry<"posts">): string[] {
	const filename = entry.id.split("/").pop() || entry.id;
	const paths = new Set<string>();

	if (CUSTOM_JEKYLL_PERMALINKS[filename]) {
		paths.add(CUSTOM_JEKYLL_PERMALINKS[filename]);
	}

	const baseTitle = filename
		.replace(/\.md$/i, "")
		.replace(/^\d{4}-\d{2}-\d{2}-/, "");
	const cat = (entry.data.category || "").trim().toLowerCase();

	if (cat && baseTitle) {
		paths.add(`${cat}/${baseTitle}`);
	} else if (baseTitle) {
		paths.add(baseTitle);
	}

	// Also add Astro slug without date prefix under category (handles lowercased or hyphenated slugs)
	const slugWithoutDate = entry.slug.replace(/^\d{4}-\d{2}-\d{2}-/, "");
	if (cat && slugWithoutDate) {
		paths.add(`${cat}/${slugWithoutDate}`);
	}

	return Array.from(paths);
}
