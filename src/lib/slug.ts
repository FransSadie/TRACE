export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function uniqueSlug(base: string, existing: Set<string>): string {
  const safeBase = base || "untitled-note";

  if (!existing.has(safeBase)) {
    return safeBase;
  }

  let counter = 2;
  while (existing.has(`${safeBase}-${counter}`)) {
    counter += 1;
  }

  return `${safeBase}-${counter}`;
}
