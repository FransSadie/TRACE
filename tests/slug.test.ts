import { slugify, uniqueSlug } from "../src/lib/slug";

describe("slug helpers", () => {
  it("slugifies note titles", () => {
    expect(slugify(" Debugging Zustand Hydration Issue ")).toBe(
      "debugging-zustand-hydration-issue",
    );
  });

  it("deduplicates duplicate slugs", () => {
    const existing = new Set(["untitled-note", "untitled-note-2"]);
    expect(uniqueSlug("untitled-note", existing)).toBe("untitled-note-3");
  });
});
