import { createId } from "./ids";

const TEMPLATE_DEFS = [
  {
    id: "fresh-news",
    name: "清爽资讯",
    description: "克制留白，适合新闻、通知和复盘。",
    style: {
      themeColor: "#2f7d68",
      fontScale: 1,
      paragraphSpacing: 18,
      imageRadius: 10
    }
  },
  {
    id: "brand-editorial",
    name: "品牌质感",
    description: "强化标题与引用，适合品牌内容。",
    style: {
      themeColor: "#8a4f7d",
      fontScale: 1.04,
      paragraphSpacing: 20,
      imageRadius: 16
    }
  },
  {
    id: "event-poster",
    name: "活动海报感",
    description: "节奏更强，适合活动和促销图文。",
    style: {
      themeColor: "#d85f35",
      fontScale: 1.08,
      paragraphSpacing: 22,
      imageRadius: 4
    }
  }
];

function cloneBlock(block) {
  return { ...block, id: createId(block.type) };
}

function insertImages(blocks, images) {
  if (images.length === 0) return blocks.map(cloneBlock);

  const result = [];
  let imageIndex = 0;

  blocks.forEach((block, index) => {
    result.push(cloneBlock(block));
    const canInsert = block.type !== "title" && imageIndex < images.length;
    const isSectionBreak = block.type === "paragraph" || block.type === "quote";
    const isNearEnd = index === blocks.length - 1;

    if (canInsert && (isSectionBreak || isNearEnd)) {
      result.push({
        id: createId("image"),
        type: "image",
        assetId: images[imageIndex].id
      });
      imageIndex += 1;
    }
  });

  return result;
}

export function createTemplates(sourceBlocks, images) {
  return TEMPLATE_DEFS.map((definition) => ({
    ...definition,
    style: { ...definition.style },
    blocks: insertImages(sourceBlocks, images)
  }));
}

export function getTemplateDefinitions() {
  return TEMPLATE_DEFS.map((definition) => ({
    ...definition,
    style: { ...definition.style }
  }));
}
