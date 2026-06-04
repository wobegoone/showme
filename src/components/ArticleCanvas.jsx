import { EditableBlock } from "./EditableBlock";

export function ArticleCanvas({
  blocks,
  imageAssets,
  style,
  templateId,
  onTextChange,
  onMoveBlock,
  onDeleteBlock
}) {
  const assetMap = new Map(imageAssets.map((asset) => [asset.id, asset]));

  return (
    <section className="canvas-shell">
      <article
        className={`article-canvas template-${templateId || "empty"}`}
        style={{
          "--theme-color": style.themeColor,
          "--font-scale": style.fontScale,
          "--paragraph-spacing": `${style.paragraphSpacing}px`
        }}
      >
        {blocks.length === 0 ? (
          <div className="empty-state">上传文档或图片素材后，点击生成图文查看公众号文章效果。</div>
        ) : (
          blocks.map((block, index) => (
            <EditableBlock
              key={block.id}
              block={block}
              imageAsset={block.type === "image" ? assetMap.get(block.assetId) : null}
              style={style}
              onTextChange={(text) => onTextChange(block.id, text)}
              onMoveUp={() => onMoveBlock(index, index - 1)}
              onMoveDown={() => onMoveBlock(index, index + 1)}
              onDelete={() => onDeleteBlock(block.id)}
            />
          ))
        )}
      </article>
    </section>
  );
}
