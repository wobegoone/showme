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
