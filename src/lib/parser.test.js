import { describe, expect, it } from "vitest";
import { parseDocumentText } from "./parser";

describe("parseDocumentText", () => {
  it("uses the first non-empty line as the title", () => {
    const blocks = parseDocumentText("\n发布会回顾\n\n第一段内容");

    expect(blocks[0]).toMatchObject({ type: "title", text: "发布会回顾" });
    expect(blocks[1]).toMatchObject({ type: "paragraph", text: "第一段内容" });
  });

  it("parses markdown headings and quotes", () => {
    const blocks = parseDocumentText("# 主标题\n\n## 亮点\n> 引用内容\n正文");

    expect(blocks.map((block) => block.type)).toEqual([
      "title",
      "heading",
      "quote",
      "paragraph"
    ]);
    expect(blocks[1].text).toBe("亮点");
  });

  it("groups consecutive plain lines into one paragraph", () => {
    const blocks = parseDocumentText("标题\n第一行\n第二行\n\n第三行");

    expect(blocks[1]).toMatchObject({
      type: "paragraph",
      text: "第一行 第二行"
    });
    expect(blocks[2]).toMatchObject({ type: "paragraph", text: "第三行" });
  });
});
