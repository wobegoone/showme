import {
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  CalendarDays,
  Gift,
  Lightbulb,
  Megaphone,
  Quote,
  Sparkles,
  Trash2
} from "lucide-react";

const ICONS = {
  BadgeCheck,
  CalendarDays,
  Gift,
  Lightbulb,
  Megaphone,
  Quote,
  Sparkles
};

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

  if (block.type === "icon") {
    const Icon = ICONS[block.icon] || Sparkles;
    return (
      <div className="editable-block icon-block">
        {controls}
        <span className="article-icon">
          <Icon size={18} />
        </span>
        <span
          className="icon-label"
          contentEditable
          suppressContentEditableWarning
          onBlur={(event) => onTextChange(event.currentTarget.textContent || "")}
        >
          {block.label}
        </span>
      </div>
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
