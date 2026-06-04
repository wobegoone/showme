import { useMemo, useState } from "react";
import { AssetPanel } from "./components/AssetPanel";
import { ArticleCanvas } from "./components/ArticleCanvas";
import { TemplatePanel } from "./components/TemplatePanel";
import { Toolbar } from "./components/Toolbar";
import { readFileAsText, readImageAsDataUrl, validateDocumentFile } from "./lib/files";
import { composeArticleFromMaterials } from "./lib/composer";
import { createId } from "./lib/ids";
import { parseDocumentText } from "./lib/parser";
import { loadDraft, saveDraft } from "./lib/storage";
import { createTemplates, getTemplateDefinitions } from "./lib/templates";

const defaultStyle = getTemplateDefinitions()[0].style;
const sampleMarkdown = `# 春季新品发布会回顾

## 现场亮点
本次发布会围绕轻量、环保和城市通勤展开，展示了三条新品线与会员专属服务。

> 好的图文排版不是装饰，而是帮读者更快抓住重点。

## 用户反馈
现场观众最关注材质升级、配色选择和售后权益。我们整理了三个最常被问到的问题，并在文末附上活动预约入口。

下一步，品牌将在公众号持续更新试用报告和门店体验日程。`;

const sampleImage =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="540" viewBox="0 0 900 540">
  <rect width="900" height="540" fill="#edf2f7"/>
  <rect x="72" y="72" width="756" height="396" rx="34" fill="#ffffff"/>
  <circle cx="232" cy="238" r="86" fill="#2f7d68" opacity="0.9"/>
  <rect x="360" y="176" width="310" height="28" rx="14" fill="#243044"/>
  <rect x="360" y="230" width="420" height="22" rx="11" fill="#8a94a6"/>
  <rect x="360" y="276" width="360" height="22" rx="11" fill="#b6bfcd"/>
  <rect x="360" y="336" width="180" height="48" rx="24" fill="#d85f35"/>
</svg>`);

export default function App() {
  const [sourceBlocks, setSourceBlocks] = useState([]);
  const [imageAssets, setImageAssets] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [currentBlocks, setCurrentBlocks] = useState([]);
  const [style, setStyle] = useState(defaultStyle);
  const [status, setStatus] = useState("上传文档和图片素材开始排版。");

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId),
    [templates, selectedTemplateId]
  );

  async function handleDocumentUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateDocumentFile(file);
    if (!validation.ok) {
      setStatus(validation.message);
      return;
    }

    try {
      const text = await readFileAsText(file);
      const blocks = parseDocumentText(text);
      if (blocks.length === 0) {
        setStatus("文档没有可解析内容，请检查后重新上传。");
        return;
      }

      setSourceBlocks(blocks);
      setCurrentBlocks(blocks);
      setTemplates([]);
      setSelectedTemplateId("");
      setStatus(`已解析 ${blocks.length} 个内容块。`);
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function handleImageUpload(event) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    try {
      const assets = await Promise.all(
        files.map(async (file) => ({
          id: createId("asset"),
          name: file.name,
          dataUrl: await readImageAsDataUrl(file)
        }))
      );
      setImageAssets((existing) => [...existing, ...assets]);
      setStatus(`已加入 ${assets.length} 张图片素材。`);
    } catch (error) {
      setStatus(error.message);
    }
  }

  function handleGenerate() {
    if (sourceBlocks.length === 0 && imageAssets.length === 0) {
      setStatus("请先上传文档或图片素材。");
      return;
    }

    const composedBlocks = composeArticleFromMaterials(currentBlocks.length ? currentBlocks : sourceBlocks, imageAssets);
    const nextTemplates = createTemplates(composedBlocks, []);
    setSourceBlocks(composedBlocks);
    setTemplates(nextTemplates);
    setSelectedTemplateId(nextTemplates[0].id);
    setCurrentBlocks(nextTemplates[0].blocks);
    setStyle(nextTemplates[0].style);
    setStatus("已根据素材生成一篇图文稿，并生成 3 套模板。");
  }

  function handleLoadSample() {
    const blocks = parseDocumentText(sampleMarkdown);
    setSourceBlocks(blocks);
    setImageAssets([
      {
        id: "asset-sample-hero",
        name: "sample-hero.svg",
        dataUrl: sampleImage
      }
    ]);
    setTemplates([]);
    setSelectedTemplateId("");
    setCurrentBlocks(blocks);
    setStyle(defaultStyle);
    setStatus("已载入示例文档和图片，可点击生成。");
  }

  function handleSelectTemplate(templateId) {
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    setSelectedTemplateId(templateId);
    setCurrentBlocks(template.blocks);
    setStyle(template.style);
  }

  function handleStyleChange(patch) {
    setStyle((current) => ({ ...current, ...patch }));
  }

  function handleTextChange(blockId, text) {
    setCurrentBlocks((blocks) =>
      blocks.map((block) => {
        if (block.id !== blockId) return block;
        if (block.type === "icon") return { ...block, label: text };
        return { ...block, text };
      })
    );
  }

  function handleInsertIcon(option) {
    const iconBlock = {
      id: createId("icon"),
      type: "icon",
      icon: option.icon,
      label: option.label
    };

    setCurrentBlocks((blocks) => {
      if (blocks.length === 0) return [iconBlock];
      const next = [...blocks];
      const insertIndex = Math.min(2, next.length);
      next.splice(insertIndex, 0, iconBlock);
      return next;
    });
    setStatus(`已插入「${option.label}」图标块，可在正文中移动或编辑。`);
  }

  function handleMoveBlock(from, to) {
    setCurrentBlocks((blocks) => {
      if (to < 0 || to >= blocks.length) return blocks;
      const next = [...blocks];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function handleDeleteBlock(blockId) {
    setCurrentBlocks((blocks) => blocks.filter((block) => block.id !== blockId));
  }

  function handleSave() {
    saveDraft({ sourceBlocks, imageAssets, templates, selectedTemplateId, currentBlocks, style });
    setStatus("草稿已保存到本地。");
  }

  function handleLoad() {
    const draft = loadDraft();
    if (!draft) {
      setStatus("没有找到本地草稿。");
      return;
    }

    setSourceBlocks(draft.sourceBlocks);
    setImageAssets(draft.imageAssets);
    setTemplates(draft.templates);
    setSelectedTemplateId(draft.selectedTemplateId);
    setCurrentBlocks(draft.currentBlocks);
    setStyle(draft.style);
    setStatus("已打开本地草稿。");
  }

  function handleReset() {
    setCurrentBlocks(selectedTemplate?.blocks || sourceBlocks);
    setStatus("已重置当前画布。");
  }

  return (
    <main className="app-shell">
      <AssetPanel
        sourceBlocks={sourceBlocks}
        imageAssets={imageAssets}
        status={status}
        onDocumentUpload={handleDocumentUpload}
        onImageUpload={handleImageUpload}
        onInsertIcon={handleInsertIcon}
      />
      <div className="workbench">
        <Toolbar
          onGenerate={handleGenerate}
          onSave={handleSave}
          onLoad={handleLoad}
          onReset={handleReset}
          onLoadSample={handleLoadSample}
        />
        <ArticleCanvas
          blocks={currentBlocks}
          imageAssets={imageAssets}
          style={style}
          templateId={selectedTemplateId}
          onTextChange={handleTextChange}
          onMoveBlock={handleMoveBlock}
          onDeleteBlock={handleDeleteBlock}
        />
      </div>
      <TemplatePanel
        templates={templates}
        selectedTemplateId={selectedTemplateId}
        style={style}
        onSelectTemplate={handleSelectTemplate}
        onStyleChange={handleStyleChange}
      />
    </main>
  );
}
