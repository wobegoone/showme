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
