import { z } from "zod";

const frontmatterSchema = z.object({
  id: z.string(),
  title: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  tags: z.array(z.string()).default([]),
  notebook: z.string().default("Inbox"),
  pinned: z.boolean().default(false),
  daily: z.boolean().default(false),
});

export type NoteFrontmatter = z.infer<typeof frontmatterSchema>;

export function parseFrontmatter(markdown: string): {
  frontmatter: NoteFrontmatter | null;
  body: string;
} {
  if (!markdown.startsWith("---\n")) {
    return { frontmatter: null, body: markdown };
  }

  const endIndex = markdown.indexOf("\n---\n", 4);
  if (endIndex === -1) {
    return { frontmatter: null, body: markdown };
  }

  const rawFrontmatter = markdown.slice(4, endIndex);
  const body = markdown.slice(endIndex + 5);
  const lines = rawFrontmatter.split("\n");
  const data: Record<string, unknown> = {};
  let activeListKey: string | null = null;

  for (const line of lines) {
    if (line.startsWith("  - ") && activeListKey) {
      const current = (data[activeListKey] as string[] | undefined) ?? [];
      current.push(line.slice(4).trim());
      data[activeListKey] = current;
      continue;
    }

    activeListKey = null;
    const separator = line.indexOf(":");
    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();

    if (value === "") {
      data[key] = [];
      activeListKey = key;
      continue;
    }

    if (value === "true" || value === "false") {
      data[key] = value === "true";
      continue;
    }

    data[key] = value;
  }

  const result = frontmatterSchema.safeParse(data);

  return {
    frontmatter: result.success ? result.data : null,
    body,
  };
}

export function serializeFrontmatter(
  frontmatter: NoteFrontmatter,
  body: string,
): string {
  const lines = [
    "---",
    `id: ${frontmatter.id}`,
    `title: ${frontmatter.title}`,
    `created_at: ${frontmatter.created_at}`,
    `updated_at: ${frontmatter.updated_at}`,
    "tags:",
    ...frontmatter.tags.map((tag) => `  - ${tag}`),
    `notebook: ${frontmatter.notebook}`,
    `pinned: ${frontmatter.pinned}`,
    `daily: ${frontmatter.daily}`,
    "---",
    "",
    body,
  ];

  return lines.join("\n");
}
