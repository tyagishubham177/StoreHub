const NON_ALPHANUMERIC = /[^a-z0-9]+/gi;

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(NON_ALPHANUMERIC, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

export function ensureUniqueSlug(base: string, existingSlugs: Set<string>) {
  let slug = slugify(base);
  if (!existingSlugs.has(slug)) {
    return slug;
  }

  let suffix = 2;
  while (existingSlugs.has(`${slug}-${suffix}`)) {
    suffix += 1;
  }

  return `${slug}-${suffix}`;
}
