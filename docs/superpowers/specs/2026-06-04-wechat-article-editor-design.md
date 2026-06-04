# WeChat Article Editor Design

## Goal

Build a local-only frontend prototype inspired by Xiumi for editing WeChat public account articles. The prototype should let users upload document and image assets, automatically structure text, fit images to a WeChat-style article canvas, generate three selectable templates, edit the generated result, and save drafts locally.

## Scope

This version is a browser-only prototype. It does not require a backend, login, cloud storage, publishing integration, or server-side document conversion.

The first supported document inputs are plain text and Markdown. If a `.docx` file is uploaded, the app should show a clear unsupported-format message in this prototype instead of silently failing. Image inputs support common browser image formats such as PNG, JPEG, GIF, and WebP.

Drafts are saved to `localStorage`. Uploaded images are stored as data URLs so saved local drafts can reopen without a server.

## Product Flow

1. The user opens a single-page workspace.
2. The user uploads a `.txt` or `.md` document and one or more image files.
3. The app parses the document into article blocks: title, headings, paragraphs, quotes, and list-like lines.
4. The app stores uploaded images in a local asset pool with preview thumbnails.
5. The user clicks generate.
6. The app creates three templates from the same parsed content and images:
   - Fresh News
   - Brand Editorial
   - Event Poster
7. The user selects one generated template.
8. The user edits text blocks, moves blocks, deletes blocks, changes theme color, adjusts font size, paragraph spacing, and image radius.
9. The user saves the draft locally and can restore it later.

## Interface

The workspace has three primary regions:

- Left sidebar: document upload, image upload, asset previews, and parsed-content status.
- Center canvas: a WeChat article preview with an approximate mobile article width of 375px. Blocks are editable directly in the canvas.
- Right sidebar: template cards, style controls, draft actions, and current article metadata.

The first screen is the editor itself, not a landing page. It should feel like an operational writing tool: compact, clear, and task-focused.

## Core Components

- `App`: Owns global editor state and coordinates upload, generation, editing, and persistence.
- `AssetPanel`: Handles document and image uploads and displays source status.
- `TemplatePanel`: Shows the three generated templates and style controls.
- `ArticleCanvas`: Renders the selected editable article.
- `EditableBlock`: Renders and edits a single text or image block.
- `Toolbar`: Provides generate, save, load, and reset actions.

## Data Model

Article blocks use a stable, serializable shape:

```ts
type ArticleBlock =
  | { id: string; type: "title" | "heading" | "paragraph" | "quote"; text: string }
  | { id: string; type: "image"; assetId: string; caption?: string };
```

Image assets are stored as:

```ts
type ImageAsset = {
  id: string;
  name: string;
  dataUrl: string;
  width?: number;
  height?: number;
};
```

Template state stores the selected template id, generated blocks, and style options:

```ts
type TemplateStyle = {
  themeColor: string;
  fontScale: number;
  paragraphSpacing: number;
  imageRadius: number;
};
```

## Generation Rules

Document parsing should be deterministic:

- The first non-empty line becomes the title.
- Markdown headings become heading blocks.
- Lines beginning with `>` become quote blocks.
- Other non-empty text groups become paragraph blocks.
- Empty lines split paragraphs.

Template generation uses the parsed blocks and inserts uploaded images after major text sections. Each image block is displayed at full article width with `max-width: 100%`, `height: auto`, and template-controlled border radius.

The three templates share content but differ in visual treatment:

- Fresh News: restrained palette, compact spacing, clear headings, lightweight dividers.
- Brand Editorial: polished typography, stronger theme color usage, quote emphasis, refined image treatment.
- Event Poster: higher contrast accents, larger title treatment, more energetic section rhythm.

## Editing Behavior

Text blocks are editable in place. Image blocks can be moved or removed. Blocks support move up, move down, and delete actions. Style controls update the selected template instantly.

The app should avoid layout jumps by keeping controls and canvas dimensions stable. Text should wrap within containers and remain readable on desktop and narrower browser widths.

## Persistence

The app saves one local draft under a stable `localStorage` key. The saved payload includes:

- Parsed source blocks
- Uploaded image assets as data URLs
- Generated templates
- Selected template id
- Current edited blocks
- Current style settings

Loading a draft replaces the current workspace state. Reset clears current state from memory but should ask for confirmation in the UI before clearing saved local data.

## Error Handling

The app should show inline messages for:

- Unsupported document types
- Empty document uploads
- Image files that cannot be read
- Generate clicked before content exists
- No saved draft found

Errors should be recoverable and should not clear existing workspace data.

## Testing Strategy

Automated tests focus on pure behavior:

- Parsing text and Markdown into article blocks
- Generating exactly three templates
- Inserting images without breaking text order
- Serializing and restoring draft state
- Rejecting unsupported document types with a clear status

Browser verification should confirm:

- The editor loads
- Upload controls and generate controls are visible
- Generated template cards appear
- The canvas renders a mobile-width article
- Saving and loading a draft works in the browser

## Implementation Notes

Because the repository is empty, the implementation should create a small Vite React app. React is appropriate for this local prototype because the editor state is component-driven, browser APIs are sufficient for file handling, and the app can be tested with Vitest.

The prototype should keep dependencies minimal. It should use plain CSS for layout and styling, with small utility functions for parsing, generation, and persistence.
