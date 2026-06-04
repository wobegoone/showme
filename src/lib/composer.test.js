import { describe, expect, it } from "vitest";
import { composeArticleFromMaterials } from "./composer";

const sourceBlocks = [
  { id: "title-1", type: "title", text: "城市咖啡节素材" },
  { id: "paragraph-1", type: "paragraph", text: "现场有手冲体验、品牌市集和限定甜品。" },
  { id: "paragraph-2", type: "paragraph", text: "活动适合朋友聚会，也适合亲子周末出行。" }
];

const images = [
  { id: "asset-1", name: "market.jpg", dataUrl: "data:image/jpeg;base64,aaa" },
  { id: "asset-2", name: "coffee.jpg", dataUrl: "data:image/jpeg;base64,bbb" }
];

describe("composeArticleFromMaterials", () => {
  it("turns source material into a complete illustrated article flow", () => {
    const article = composeArticleFromMaterials(sourceBlocks, images);

    expect(article[0]).toMatchObject({ type: "title", text: "城市咖啡节素材" });
    expect(article.some((block) => block.type === "icon" && block.label === "素材亮点")).toBe(true);
    expect(article.filter((block) => block.type === "image").map((block) => block.assetId)).toEqual([
      "asset-1",
      "asset-2"
    ]);
    expect(article.at(-1)).toMatchObject({
      type: "paragraph",
      text: expect.stringContaining("适合直接作为公众号图文")
    });
  });

  it("creates a usable article when only images are provided", () => {
    const article = composeArticleFromMaterials([], images);

    expect(article[0]).toMatchObject({ type: "title", text: "素材图文精选" });
    expect(article.some((block) => block.type === "image")).toBe(true);
    expect(article.some((block) => block.type === "quote")).toBe(true);
  });
});
