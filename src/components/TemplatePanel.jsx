export function TemplatePanel({
  templates,
  selectedTemplateId,
  style,
  onSelectTemplate,
  onStyleChange
}) {
  return (
    <aside className="panel template-panel" style={{ "--active-color": style.themeColor }}>
      <div className="panel-header">
        <p className="eyebrow">模板</p>
        <h2>生成方案</h2>
      </div>
      <div className="template-list">
        {templates.length === 0 ? <p className="muted-text">生成后展示 3 套模板。</p> : null}
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            className={`template-card ${template.id === selectedTemplateId ? "is-active" : ""}`}
            onClick={() => onSelectTemplate(template.id)}
          >
            <strong>{template.name}</strong>
            <span>{template.description}</span>
          </button>
        ))}
      </div>
      <div className="style-controls">
        <label>
          主题色
          <input
            type="color"
            value={style.themeColor}
            onChange={(event) => onStyleChange({ themeColor: event.target.value })}
          />
        </label>
        <label>
          字号
          <input
            type="range"
            min="0.9"
            max="1.18"
            step="0.01"
            value={style.fontScale}
            onChange={(event) => onStyleChange({ fontScale: Number(event.target.value) })}
          />
        </label>
        <label>
          段距
          <input
            type="range"
            min="12"
            max="30"
            value={style.paragraphSpacing}
            onChange={(event) => onStyleChange({ paragraphSpacing: Number(event.target.value) })}
          />
        </label>
        <label>
          圆角
          <input
            type="range"
            min="0"
            max="24"
            value={style.imageRadius}
            onChange={(event) => onStyleChange({ imageRadius: Number(event.target.value) })}
          />
        </label>
      </div>
    </aside>
  );
}
