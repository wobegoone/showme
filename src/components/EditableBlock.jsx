import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

export function EditableBlock({
  block,
  imageAsset,
  style,
  onTextChange,
  onMoveUp,
  onMoveDown,
  onDelete
}) {
  const controls = (
    <div className="block-controls">
      <button type="button" onClick={onMoveUp} title="上移">
        <ArrowUp size={14} />
      </button>
      <button type="button" onClick={onMoveDown} title="下移">
        <ArrowDown size={14} />
      </button>
      <button type="button" onClick={onDelete} title="删除">
        <Trash2 size={14} />
      </button>
    </div>
  );

  if (block.type === "image") {
    return (
      <figure className="editable-block image-block">
        {controls}
        {imageAsset ? (
          <img
            src={imageAsset.dataUrl}
            alt={imageAsset.name}
            style={{ borderRadius: `${style.imageRadius}px` }}
          />
        ) : (
          <div className="missing-image">图片素材缺失</div>
        )}
      </figure>
    );
  }

  const Tag = block.type === "title" ? "h1" : block.type === "heading" ? "h2" : "p";
  return (
    <div className={`editable-block text-block ${block.type}`}>
      {controls}
      <Tag
        contentEditable
        suppressContentEditableWarning
        onBlur={(event) => onTextChange(event.currentTarget.textContent || "")}
      >
        {block.text}
      </Tag>
    </div>
  );
}
