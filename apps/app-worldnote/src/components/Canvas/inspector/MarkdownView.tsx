import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownViewProps = {
  content: string;
};

/** CommonMark requires a space after # for ATX headings (e.g. `# Title`). */
function normalizeMarkdown(content: string): string {
  return content.replace(/^(#{1,6})([^\s#\n])/gm, "$1 $2");
}

export function MarkdownView({ content }: MarkdownViewProps) {
  const normalized = normalizeMarkdown(content);

  if (!normalized.trim()) {
    return (
      <p className="text-sm text-wn-mono-500">No lore written yet.</p>
    );
  }

  return (
    <div className="inspector-markdown leading-relaxed text-wn-mono-200">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{normalized}</ReactMarkdown>
    </div>
  );
}
