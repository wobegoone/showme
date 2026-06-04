export function AssetPanel({
  sourceBlocks,
  imageAssets,
  status,
  onDocumentUpload,
  onImageUpload
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
