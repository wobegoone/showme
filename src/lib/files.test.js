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
