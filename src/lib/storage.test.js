import { beforeEach, describe, expect, it } from "vitest";
import { loadDraft, saveDraft } from "./storage";

const draft = {
  sourceBlocks: [{ id: "title-1", type: "title", text: "标题" }],
  imageAssets: [],
  templates: [],
  selectedTemplateId: "fresh-news",
  currentBlocks: [
    { id: "title-2", type: "title", text: "标题" },
    { id: "icon-1", type: "icon", icon: "BadgeCheck", label: "重点" }
  ],
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
