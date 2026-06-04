import { FileDown, FolderOpen, RefreshCw, Sparkles, Wand2 } from "lucide-react";

export function Toolbar({ onGenerate, onSave, onLoad, onReset, onLoadSample }) {
  return (
    <div className="toolbar">
      <button type="button" onClick={onLoadSample} title="载入示例">
        <Sparkles size={16} /> 示例
      </button>
      <button type="button" className="primary-action" onClick={onGenerate} title="生成图文文章">
        <Wand2 size={16} /> 生成图文
      </button>
      <button type="button" onClick={onSave} title="保存草稿">
        <FileDown size={16} /> 保存
      </button>
      <button type="button" onClick={onLoad} title="打开本地草稿">
        <FolderOpen size={16} /> 打开
      </button>
      <button type="button" onClick={onReset} title="重置当前编辑">
        <RefreshCw size={16} /> 重置
      </button>
    </div>
  );
}
