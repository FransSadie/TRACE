import { parseWikiLinks } from "../src/lib/wikiLinks";

describe("wiki link parsing", () => {
  it("extracts wiki links from markdown", () => {
    expect(parseWikiLinks("See [[State Management Pitfalls]] and [[Inbox|Alias]].")).toEqual([
      { raw: "[[State Management Pitfalls]]", targetTitle: "State Management Pitfalls" },
      { raw: "[[Inbox|Alias]]", targetTitle: "Alias" },
    ]);
  });
});
