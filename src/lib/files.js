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
