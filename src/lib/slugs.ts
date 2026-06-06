interface SlugCandidate {
  id: string;
  content: Record<string, unknown>;
}

export function slugify(value: string, fallback: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return slug || fallback;
}

export function buildPublishedTitleSlugEntries<T extends SlugCandidate>(items: T[]): Array<{ item: T; slug: string }> {
  const seen = new Map<string, number>();

  return [...items]
    .filter((item) => item.content.published === true)
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((item) => {
      const base = slugify(String(item.content.title ?? ''), item.id);
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      const slug = count === 0 ? base : `${base}-${count + 1}`;
      return { item, slug };
    });
}
