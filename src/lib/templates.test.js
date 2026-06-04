import { describe, expect, it } from "vitest";
import { createTemplates } from "./templates";

const blocks = [
  { id: "title-1", type: "title", text: "标题" },
  { id: "paragraph-1", type: "paragraph", text: "第一段" },
  { id: "heading-1", type: "heading", text: "亮点" },
  { id: "paragraph-2", type: "paragraph", text: "第二段" }
];

const images = [
  { id: "image-1", name: "a.png", dataUrl: "data:image/png;base64,aaa" }
];

describe("createTemplates", () => {
  it("creates exactly three selectable templates", () => {
    const templates = createTemplates(blocks, images);

    expect(templates.map((template) => template.id)).toEqual([
      "fresh-news",
      "brand-editorial",
      "event-poster"
    ]);
  });

  it("inserts images without changing source text order", () => {
    const [template] = createTemplates(blocks, images);

    expect(template.blocks.some((block) => block.type === "image")).toBe(true);
    expect(template.blocks.filter((block) => block.text).map((block) => block.text)).toEqual([
      "标题",
      "第一段",
      "亮点",
      "第二段"
    ]);
  });

  it("keeps inserted icon blocks in the generated article flow", () => {
    const iconBlocks = [
      blocks[0],
      { id: "icon-1", type: "icon", icon: "Sparkles", label: "亮点提示" },
      blocks[1]
    ];
    const [template] = createTemplates(iconBlocks, []);

    expect(template.blocks.map((block) => block.type)).toEqual(["title", "icon", "paragraph"]);
    expect(template.blocks[1]).toMatchObject({ type: "icon", icon: "Sparkles", label: "亮点提示" });
  });
});
