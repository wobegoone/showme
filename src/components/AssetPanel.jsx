import {
  BadgeCheck,
  CalendarDays,
  Gift,
  Lightbulb,
  Megaphone,
  Quote,
  Sparkles
} from "lucide-react";

const ICON_OPTIONS = [
  { icon: "Sparkles", label: "亮点", Component: Sparkles },
  { icon: "BadgeCheck", label: "确认", Component: BadgeCheck },
  { icon: "Lightbulb", label: "提示", Component: Lightbulb },
  { icon: "CalendarDays", label: "日程", Component: CalendarDays },
  { icon: "Gift", label: "福利", Component: Gift },
  { icon: "Megaphone", label: "公告", Component: Megaphone },
  { icon: "Quote", label: "引用", Component: Quote }
];

export function AssetPanel({
  sourceBlocks,
  imageAssets,
  status,
  onDocumentUpload,
  onImageUpload,
  onInsertIcon
}) {
  return (
    <aside className="panel asset-panel">
      <div className="panel-header">
        <p className="eyebrow">素材</p>
        <h2>文档与图片</h2>
      </div>
      <label className="upload-box">
        <span>上传文档</span>
        <input type="file" accept=".txt,.md,.markdown,.docx" onChange={onDocumentUpload} />
      </label>
      <label className="upload-box">
        <span>上传图片素材</span>
        <input type="file" accept="image/*" multiple onChange={onImageUpload} />
      </label>
      <section className="icon-palette" aria-label="图标素材">
        <div className="section-heading">
          <span>图标素材</span>
          <small>点击插入正文</small>
        </div>
        <div className="icon-grid">
          {ICON_OPTIONS.map(({ icon, label, Component }) => (
            <button
              key={icon}
              type="button"
              className="icon-choice"
              onClick={() => onInsertIcon({ icon, label })}
              title={`插入${label}图标`}
            >
              <Component size={18} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>
      {status ? <p className="status-text">{status}</p> : null}
      <div className="source-summary">
        <strong>{sourceBlocks.length}</strong>
        <span>个内容块</span>
      </div>
      <div className="asset-grid">
        {imageAssets.map((asset) => (
          <img key={asset.id} src={asset.dataUrl} alt={asset.name} />
        ))}
      </div>
    </aside>
  );
}
