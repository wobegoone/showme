import { createId } from "./ids";

function textBlock(type, text) {
  return {
    id: createId(type),
    type,
    text
  };
}

function iconBlock(icon, label) {
  return {
    id: createId("icon"),
    type: "icon",
    icon,
    label
  };
}

function imageBlock(assetId) {
  return {
    id: createId("image"),
    type: "image",
    assetId
  };
}

function normalizeSource(sourceBlocks) {
  return sourceBlocks.filter((block) => block.type !== "image");
}

export function composeArticleFromMaterials(sourceBlocks, imageAssets) {
  const textBlocks = normalizeSource(sourceBlocks);
  const titleBlock = textBlocks.find((block) => block.type === "title");
  const bodyBlocks = textBlocks.filter((block) => block.type !== "title");
  const title = titleBlock?.text || "素材图文精选";
  const article = [
    textBlock("title", title),
    textBlock(
      "paragraph",
      bodyBlocks[0]?.text ||
        "我们从上传素材中整理出这篇图文内容，围绕画面信息、重点细节和阅读节奏完成公众号排版。"
    ),
    iconBlock("Sparkles", "素材亮点")
  ];

  if (imageAssets[0]) {
    article.push(imageBlock(imageAssets[0].id));
  }

  article.push(
    textBlock(
      "heading",
      bodyBlocks.some((block) => block.type === "heading") ? "内容梳理" : "核心看点"
    )
  );

  const remainingBody = bodyBlocks.slice(1);
  if (remainingBody.length > 0) {
    remainingBody.forEach((block, index) => {
      article.push({ ...block, id: createId(block.type) });
      const nextImage = imageAssets[index + 1];
      if (nextImage && (block.type === "paragraph" || block.type === "quote")) {
        article.push(imageBlock(nextImage.id));
      }
    });
  } else {
    article.push(
      textBlock(
        "paragraph",
        "图片素材已经按公众号阅读宽度自适应插入，正文可继续补充活动信息、产品卖点或现场说明。"
      )
    );
    imageAssets.slice(1).forEach((asset) => article.push(imageBlock(asset.id)));
  }

  article.push(
    iconBlock("BadgeCheck", "排版建议"),
    textBlock(
      "quote",
      "保留一条清晰主线，用图片承接情绪，用小标题帮助读者快速浏览。"
    ),
    textBlock(
      "paragraph",
      "以上内容已整理成适合直接作为公众号图文继续编辑的结构，你可以调整图片顺序、改写标题或替换图标强调重点。"
    )
  );

  return article;
}
