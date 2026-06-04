# WeChat Article Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-only WeChat public account article editor prototype with document upload, image assets, three generated templates, editable article blocks, and local draft saving.

**Architecture:** Create a small Vite React app with pure utility modules for parsing, template generation, and draft persistence. Keep UI state in `App.jsx`, with focused components for assets, templates, toolbar, canvas, and editable blocks. Use Vitest for pure behavior and a browser pass for the complete editor flow.

**Tech Stack:** Vite, React, Vitest, Testing Library, plain CSS, browser FileReader/localStorage APIs.

---

## File Structure

- Create `package.json`: project scripts and dependencies.
- Create `index.html`: Vite entry shell.
- Create `vite.config.js`: React/Vitest config with jsdom.
- Create `src/main.jsx`: React mount.
- Create `src/App.jsx`: application state, upload handlers, generation, editing, persistence.
- Create `src/styles.css`: full editor layout and template styling.
- Create `src/lib/ids.js`: stable local id generator.
- Create `src/lib/parser.js`: parse text and Markdown into article blocks.
- Create `src/lib/templates.js`: generate three template variants and insert image blocks.
- Create `src/lib/storage.js`: serialize and restore the local draft.
- Create `src/lib/files.js`: validate document types and read files.
- Create `src/components/AssetPanel.jsx`: document and image upload area.
- Create `src/components/Toolbar.jsx`: generate, save, load, reset controls.
- Create `src/components/TemplatePanel.jsx`: template cards and style controls.
- Create `src/components/ArticleCanvas.jsx`: selected article preview.
- Create `src/components/EditableBlock.jsx`: block editing and ordering controls.
- Create `src/lib/parser.test.js`: parser tests.
- Create `src/lib/templates.test.js`: generation tests.
- Create `src/lib/storage.test.js`: persistence tests.
- Create `src/lib/files.test.js`: document validation tests.

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.js`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/styles.css`

- [ ] **Step 1: Create package and Vite config**

```json
{
  "name": "wechat-article-editor",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.4.1",
    "vite": "^6.3.5",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "jsdom": "^26.1.0",
    "vitest": "^3.2.0"
  }
}
```

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: []
  }
});
```

- [ ] **Step 2: Create the Vite entry files**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>公众号图文编辑器</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

```jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 3: Create a minimal app shell**

```jsx
export default function App() {
  return (
    <main className="app-shell">
      <section className="panel">素材</section>
      <section className="canvas-shell">公众号图文编辑器</section>
      <section className="panel">模板</section>
    </main>
  );
}
```

```css
:root {
  font-family: Inter, "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
  color: #1f2937;
  background: #f4f5f7;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 280px minmax(360px, 1fr) 320px;
  gap: 16px;
  padding: 16px;
}

.panel,
.canvas-shell {
  background: #ffffff;
  border: 1px solid #d9dee8;
  border-radius: 8px;
  min-height: 200px;
}
```

- [ ] **Step 4: Install dependencies**

Run: `pnpm install`

Expected: lockfile created and dependencies installed.

- [ ] **Step 5: Verify scaffold builds**

Run: `pnpm build`

Expected: Vite build completes successfully.

---

### Task 2: Parser and File Validation

**Files:**
- Create: `src/lib/ids.js`
- Create: `src/lib/parser.js`
- Create: `src/lib/files.js`
- Test: `src/lib/parser.test.js`
- Test: `src/lib/files.test.js`

- [ ] **Step 1: Write failing parser tests**

```js
import { describe, expect, it } from "vitest";
import { parseDocumentText } from "./parser";

describe("parseDocumentText", () => {
  it("uses the first non-empty line as the title", () => {
    const blocks = parseDocumentText("\n发布会回顾\n\n第一段内容");
    expect(blocks[0]).toMatchObject({ type: "title", text: "发布会回顾" });
    expect(blocks[1]).toMatchObject({ type: "paragraph", text: "第一段内容" });
  });

  it("parses markdown headings and quotes", () => {
    const blocks = parseDocumentText("# 主标题\n\n## 亮点\n> 引用内容\n正文");
    expect(blocks.map((block) => block.type)).toEqual([
      "title",
      "heading",
      "quote",
      "paragraph"
    ]);
    expect(blocks[1].text).toBe("亮点");
  });

  it("groups consecutive plain lines into one paragraph", () => {
    const blocks = parseDocumentText("标题\n第一行\n第二行\n\n第三行");
    expect(blocks[1]).toMatchObject({
      type: "paragraph",
      text: "第一行 第二行"
    });
    expect(blocks[2]).toMatchObject({ type: "paragraph", text: "第三行" });
  });
});
```

- [ ] **Step 2: Run parser tests to verify failure**

Run: `pnpm test src/lib/parser.test.js`

Expected: FAIL because `src/lib/parser.js` does not exist.

- [ ] **Step 3: Implement parser and ids**

```js
let counter = 0;

export function createId(prefix = "id") {
  counter += 1;
  return `${prefix}-${counter}`;
}
```

```js
import { createId } from "./ids";

function createTextBlock(type, text) {
  return {
    id: createId(type),
    type,
    text: text.trim()
  };
}

export function parseDocumentText(input) {
  const lines = input
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim());

  const blocks = [];
  let paragraphLines = [];
  let titleSeen = false;

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    const text = paragraphLines.join(" ").replace(/\s+/g, " ").trim();
    if (text) blocks.push(createTextBlock("paragraph", text));
    paragraphLines = [];
  };

  for (const line of lines) {
    if (!line) {
      flushParagraph();
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    const quoteMatch = line.match(/^>\s*(.+)$/);

    if (!titleSeen) {
      titleSeen = true;
      const title = headingMatch ? headingMatch[2] : line;
      blocks.push(createTextBlock("title", title));
      continue;
    }

    if (headingMatch) {
      flushParagraph();
      blocks.push(createTextBlock("heading", headingMatch[2]));
      continue;
    }

    if (quoteMatch) {
      flushParagraph();
      blocks.push(createTextBlock("quote", quoteMatch[1]));
      continue;
    }

    paragraphLines.push(line.replace(/^[-*]\s+/, ""));
  }

  flushParagraph();
  return blocks;
}
```

- [ ] **Step 4: Verify parser tests pass**

Run: `pnpm test src/lib/parser.test.js`

Expected: PASS.

- [ ] **Step 5: Write failing file validation tests**

```js
import { describe, expect, it } from "vitest";
import { validateDocumentFile } from "./files";

describe("validateDocumentFile", () => {
  it("accepts txt and markdown files", () => {
    expect(validateDocumentFile({ name: "demo.txt", type: "text/plain" })).toEqual({
      ok: true
    });
    expect(validateDocumentFile({ name: "demo.md", type: "text/markdown" })).toEqual({
      ok: true
    });
  });

  it("rejects docx with a clear prototype message", () => {
    expect(validateDocumentFile({ name: "demo.docx", type: "" })).toEqual({
      ok: false,
      message: "当前本地原型暂不解析 .docx，请上传 .txt 或 .md 文档。"
    });
  });
});
```

- [ ] **Step 6: Run file tests to verify failure**

Run: `pnpm test src/lib/files.test.js`

Expected: FAIL because `validateDocumentFile` does not exist.

- [ ] **Step 7: Implement file validation**

```js
export function validateDocumentFile(file) {
  const name = file.name.toLowerCase();

  if (name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".markdown")) {
    return { ok: true };
  }

  if (name.endsWith(".docx")) {
    return {
      ok: false,
      message: "当前本地原型暂不解析 .docx，请上传 .txt 或 .md 文档。"
    };
  }

  return {
    ok: false,
    message: "仅支持上传 .txt 或 .md 文档。"
  };
}

export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("文档读取失败，请重新上传。"));
    reader.readAsText(file);
  });
}

export function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("图片读取失败，请重新上传。"));
    reader.readAsDataURL(file);
  });
}
```

- [ ] **Step 8: Verify parser and file tests pass**

Run: `pnpm test src/lib/parser.test.js src/lib/files.test.js`

Expected: PASS.

---

### Task 3: Template Generation

**Files:**
- Create: `src/lib/templates.js`
- Test: `src/lib/templates.test.js`

- [ ] **Step 1: Write failing generation tests**

```js
import { describe, expect, it } from "vitest";
import { createTemplates } from "./templates";

const blocks = [
  { id: "title-1", type: "title", text: "标题" },
  { id: "paragraph-1", type: "paragraph", text: "第一段" },
  { id: "heading-1", type: "heading", text: "亮点" },
  { id: "paragraph-2", type: "paragraph", text: "第二段" }
];

const images = [
  { id: "image-1", name: "a.png", dataUrl: "data:image/png;base64,aaa" }
];

describe("createTemplates", () => {
  it("creates exactly three selectable templates", () => {
    const templates = createTemplates(blocks, images);
    expect(templates.map((template) => template.id)).toEqual([
      "fresh-news",
      "brand-editorial",
      "event-poster"
    ]);
  });

  it("inserts images without changing source text order", () => {
    const [template] = createTemplates(blocks, images);
    expect(template.blocks.some((block) => block.type === "image")).toBe(true);
    expect(template.blocks.filter((block) => block.text).map((block) => block.text)).toEqual([
      "标题",
      "第一段",
      "亮点",
      "第二段"
    ]);
  });
});
```

- [ ] **Step 2: Run template tests to verify failure**

Run: `pnpm test src/lib/templates.test.js`

Expected: FAIL because `createTemplates` does not exist.

- [ ] **Step 3: Implement template generation**

```js
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
    blocks: insertImages(sourceBlocks, images)
  }));
}

export function getTemplateDefinitions() {
  return TEMPLATE_DEFS;
}
```

- [ ] **Step 4: Verify template tests pass**

Run: `pnpm test src/lib/templates.test.js`

Expected: PASS.

---

### Task 4: Local Draft Persistence

**Files:**
- Create: `src/lib/storage.js`
- Test: `src/lib/storage.test.js`

- [ ] **Step 1: Write failing storage tests**

```js
import { beforeEach, describe, expect, it } from "vitest";
import { loadDraft, saveDraft } from "./storage";

const draft = {
  sourceBlocks: [{ id: "title-1", type: "title", text: "标题" }],
  imageAssets: [],
  templates: [],
  selectedTemplateId: "fresh-news",
  currentBlocks: [{ id: "title-2", type: "title", text: "标题" }],
  style: {
    themeColor: "#2f7d68",
    fontScale: 1,
    paragraphSpacing: 18,
    imageRadius: 10
  }
};

describe("draft storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and restores a draft", () => {
    saveDraft(draft);
    expect(loadDraft()).toEqual(draft);
  });

  it("returns null when no draft exists", () => {
    expect(loadDraft()).toBeNull();
  });
});
```

- [ ] **Step 2: Run storage tests to verify failure**

Run: `pnpm test src/lib/storage.test.js`

Expected: FAIL because `storage.js` does not exist.

- [ ] **Step 3: Implement storage helpers**

```js
export const DRAFT_KEY = "showme.wechatArticleEditor.draft";

export function saveDraft(draft) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function loadDraft() {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  return JSON.parse(raw);
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}
```

- [ ] **Step 4: Verify storage tests pass**

Run: `pnpm test src/lib/storage.test.js`

Expected: PASS.

---

### Task 5: Editor UI

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/styles.css`
- Create: `src/components/AssetPanel.jsx`
- Create: `src/components/Toolbar.jsx`
- Create: `src/components/TemplatePanel.jsx`
- Create: `src/components/ArticleCanvas.jsx`
- Create: `src/components/EditableBlock.jsx`

- [ ] **Step 1: Implement the asset panel**

```jsx
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
```

- [ ] **Step 2: Implement toolbar and template panel**

```jsx
import { FileDown, FolderOpen, RefreshCw, Wand2 } from "lucide-react";

export function Toolbar({ onGenerate, onSave, onLoad, onReset }) {
  return (
    <div className="toolbar">
      <button type="button" onClick={onGenerate} title="生成模板">
        <Wand2 size={16} /> 生成
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
```

```jsx
export function TemplatePanel({
  templates,
  selectedTemplateId,
  style,
  onSelectTemplate,
  onStyleChange
}) {
  return (
    <aside className="panel template-panel">
      <div className="panel-header">
        <p className="eyebrow">模板</p>
        <h2>生成方案</h2>
      </div>
      <div className="template-list">
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
```

- [ ] **Step 3: Implement editable canvas components**

```jsx
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
      <button type="button" onClick={onMoveUp} title="上移"><ArrowUp size={14} /></button>
      <button type="button" onClick={onMoveDown} title="下移"><ArrowDown size={14} /></button>
      <button type="button" onClick={onDelete} title="删除"><Trash2 size={14} /></button>
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
```

```jsx
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
          <div className="empty-state">上传文档和图片后，点击生成查看排版效果。</div>
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
```

- [ ] **Step 4: Wire state in App**

```jsx
import { useMemo, useState } from "react";
import { AssetPanel } from "./components/AssetPanel";
import { ArticleCanvas } from "./components/ArticleCanvas";
import { TemplatePanel } from "./components/TemplatePanel";
import { Toolbar } from "./components/Toolbar";
import { readFileAsText, readImageAsDataUrl, validateDocumentFile } from "./lib/files";
import { createId } from "./lib/ids";
import { parseDocumentText } from "./lib/parser";
import { loadDraft, saveDraft } from "./lib/storage";
import { createTemplates, getTemplateDefinitions } from "./lib/templates";

const defaultStyle = getTemplateDefinitions()[0].style;

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
  }

  async function handleImageUpload(event) {
    const files = Array.from(event.target.files || []);
    const assets = await Promise.all(
      files.map(async (file) => ({
        id: createId("asset"),
        name: file.name,
        dataUrl: await readImageAsDataUrl(file)
      }))
    );
    setImageAssets((existing) => [...existing, ...assets]);
    setStatus(`已加入 ${assets.length} 张图片素材。`);
  }

  function handleGenerate() {
    if (sourceBlocks.length === 0) {
      setStatus("请先上传可解析的文档。");
      return;
    }
    const nextTemplates = createTemplates(sourceBlocks, imageAssets);
    setTemplates(nextTemplates);
    setSelectedTemplateId(nextTemplates[0].id);
    setCurrentBlocks(nextTemplates[0].blocks);
    setStyle(nextTemplates[0].style);
    setStatus("已生成 3 套模板，可在右侧选择。");
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
      blocks.map((block) => (block.id === blockId ? { ...block, text } : block))
    );
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
      />
      <div className="workbench">
        <Toolbar
          onGenerate={handleGenerate}
          onSave={handleSave}
          onLoad={handleLoad}
          onReset={handleReset}
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
```

- [ ] **Step 5: Replace CSS with the full editor styling**

```css
:root {
  font-family: Inter, "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
  color: #243044;
  background: #eef1f5;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
}

.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 280px minmax(390px, 1fr) 320px;
  gap: 16px;
  padding: 16px;
}

.panel {
  background: #ffffff;
  border: 1px solid #d9dee8;
  border-radius: 8px;
  padding: 16px;
  min-width: 0;
}

.panel-header h2 {
  margin: 0;
  font-size: 18px;
}

.eyebrow {
  margin: 0 0 4px;
  color: #6b7280;
  font-size: 12px;
}

.upload-box {
  display: grid;
  gap: 8px;
  margin-top: 14px;
  padding: 14px;
  border: 1px dashed #b6bfcd;
  border-radius: 8px;
  background: #f8fafc;
}

.status-text {
  margin: 14px 0;
  color: #44546a;
  line-height: 1.6;
}

.source-summary {
  display: flex;
  gap: 6px;
  align-items: baseline;
  padding: 12px 0;
  border-top: 1px solid #eef1f5;
}

.source-summary strong {
  font-size: 24px;
  color: #111827;
}

.asset-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.asset-grid img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 6px;
}

.workbench {
  min-width: 0;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.toolbar button,
.block-controls button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 34px;
  border: 1px solid #cfd6e3;
  border-radius: 8px;
  background: #ffffff;
  color: #243044;
}

.toolbar button {
  padding: 0 12px;
}

.canvas-shell {
  min-height: calc(100vh - 82px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 24px;
  background: #dfe5ee;
  border: 1px solid #cfd6e3;
  border-radius: 8px;
  overflow: auto;
}

.article-canvas {
  width: min(375px, 100%);
  min-height: 640px;
  padding: 28px 24px;
  background: #ffffff;
  color: #253042;
  box-shadow: 0 14px 36px rgba(32, 41, 57, 0.16);
}

.empty-state {
  min-height: 560px;
  display: grid;
  place-items: center;
  color: #667085;
  text-align: center;
  line-height: 1.7;
}

.editable-block {
  position: relative;
  margin-bottom: var(--paragraph-spacing);
}

.block-controls {
  position: absolute;
  right: -12px;
  top: -12px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.editable-block:hover .block-controls {
  opacity: 1;
}

.block-controls button {
  width: 28px;
  height: 28px;
  min-height: 28px;
  padding: 0;
  background: #ffffff;
}

.text-block h1,
.text-block h2,
.text-block p {
  outline: none;
  overflow-wrap: anywhere;
}

.text-block h1 {
  margin: 0 0 22px;
  font-size: calc(28px * var(--font-scale));
  line-height: 1.28;
  color: #111827;
}

.text-block h2 {
  margin: 28px 0 12px;
  padding-left: 10px;
  border-left: 4px solid var(--theme-color);
  font-size: calc(20px * var(--font-scale));
  line-height: 1.35;
}

.text-block p {
  margin: 0;
  font-size: calc(16px * var(--font-scale));
  line-height: 1.85;
}

.text-block.quote p {
  padding: 12px 14px;
  border-left: 4px solid var(--theme-color);
  background: color-mix(in srgb, var(--theme-color) 10%, white);
  color: #44546a;
}

.image-block {
  margin: 20px 0;
}

.image-block img {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
}

.missing-image {
  padding: 32px;
  background: #f1f5f9;
  color: #667085;
  text-align: center;
  border-radius: 8px;
}

.template-list {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.template-card {
  display: grid;
  gap: 5px;
  width: 100%;
  padding: 12px;
  border: 1px solid #d9dee8;
  border-radius: 8px;
  background: #ffffff;
  color: #243044;
  text-align: left;
}

.template-card span {
  color: #667085;
  line-height: 1.5;
}

.template-card.is-active {
  border-color: var(--active-color, #2f7d68);
  box-shadow: inset 0 0 0 1px var(--active-color, #2f7d68);
}

.style-controls {
  display: grid;
  gap: 14px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #eef1f5;
}

.style-controls label {
  display: grid;
  gap: 8px;
  color: #44546a;
}

.template-brand-editorial .text-block h1 {
  padding-bottom: 16px;
  border-bottom: 2px solid var(--theme-color);
}

.template-event-poster .text-block h1 {
  padding: 14px;
  background: var(--theme-color);
  color: #ffffff;
}

@media (max-width: 980px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .canvas-shell {
    min-height: 560px;
  }
}
```

- [ ] **Step 6: Run build**

Run: `pnpm build`

Expected: PASS.

---

### Task 6: Final Verification

**Files:**
- Modify files only if verification reveals issues.

- [ ] **Step 1: Run all automated tests**

Run: `pnpm test`

Expected: PASS for parser, file validation, templates, and storage.

- [ ] **Step 2: Run production build**

Run: `pnpm build`

Expected: PASS.

- [ ] **Step 3: Start local dev server**

Run: `pnpm dev`

Expected: Vite serves the app at `http://127.0.0.1:5173`.

- [ ] **Step 4: Browser verification**

Open `http://127.0.0.1:5173` and confirm:

- The editor loads with left asset panel, center canvas, and right template panel.
- Upload controls are visible.
- Generate, save, open, and reset controls are visible.
- The empty canvas renders without console errors.
- After entering source content through upload or a dev-created sample file, generate shows three template cards and a mobile-width article.

- [ ] **Step 5: Commit implementation**

Run:

```bash
git add package.json pnpm-lock.yaml index.html vite.config.js src docs/superpowers/plans/2026-06-04-wechat-article-editor.md
git commit -m "feat: build local wechat article editor"
```

Expected: commit succeeds.
