import { parseFrontmatter, serializeFrontmatter } from "../src/lib/frontmatter";

describe("frontmatter parsing", () => {
  it("parses valid note frontmatter", () => {
    const markdown = `---
id: note-1
title: Sample
created_at: 2026-03-17T12:00:00Z
updated_at: 2026-03-17T12:05:00Z
tags:
  - rust
  - sqlite
notebook: Inbox
pinned: false
daily: false
---

# Sample`;

    const result = parseFrontmatter(markdown);

    expect(result.frontmatter?.title).toBe("Sample");
    expect(result.frontmatter?.tags).toEqual(["rust", "sqlite"]);
    expect(result.body.trim()).toBe("# Sample");
  });

  it("serializes frontmatter back to markdown", () => {
    const output = serializeFrontmatter(
      {
        id: "note-2",
        title: "Round trip",
        created_at: "2026-03-17T12:00:00Z",
        updated_at: "2026-03-17T12:10:00Z",
        tags: ["react"],
        notebook: "Inbox",
        pinned: true,
        daily: false,
      },
      "Body content",
    );

    expect(output).toContain("title: Round trip");
    expect(output).toContain("  - react");
    expect(output).toContain("Body content");
  });
});
