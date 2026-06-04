import { MaterialSymbol, Pill, type PillTone } from "@worldnote/ui";
import { cx } from "../wizard/cx.js";
import { useCallback, useRef, useState } from "react";
import { inspectorSectionLabelClassName } from "./inspectorFieldStyles.js";

const TAG_TONES: PillTone[] = [
  "azure",
  "indigo",
  "amber",
  "lime",
  "rose",
  "mono",
];

const draftPillToneClassNames: Record<PillTone, string> = {
  mono: "bg-wn-mono-300 text-wn-mono-950",
  "mono-dark": "bg-wn-mono-800 text-wn-mono-50",
  azure: "bg-wn-azure-200 text-wn-mono-950",
  indigo: "bg-wn-indigo-200 text-wn-mono-950",
  amber: "bg-wn-amber-200 text-wn-mono-950",
  lime: "bg-wn-lime-300 text-wn-mono-950",
  rose: "bg-wn-rose-300 text-wn-mono-950",
  outline: "border border-wn-mono-700 bg-wn-mono-950 text-wn-mono-400",
};

function tagTone(index: number): PillTone {
  return TAG_TONES[index % TAG_TONES.length] ?? "mono";
}

function tagKey(tag: string, index: number): string {
  return `${index}:${tag}`;
}

type RemovableTagPillProps = {
  tag: string;
  tone: PillTone;
  onRemove: () => void;
};

function RemovableTagPill({ tag, tone, onRemove }: RemovableTagPillProps) {
  return (
    <span className="group/tag relative inline-flex max-w-full items-center">
      <Pill
        tone={tone}
        size="sm"
        className="max-w-full pr-1 transition-[padding] group-hover/tag:pr-5"
      >
        <span className="truncate">{tag}</span>
      </Pill>
      <button
        type="button"
        className={cx(
          "absolute right-0.5 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full p-0.5",
          "opacity-0 transition-opacity duration-150",
          "group-hover/tag:opacity-100 focus-visible:opacity-100",
          "text-wn-mono-950 hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wn-azure-500",
        )}
        aria-label={`Remove tag ${tag}`}
        onClick={onRemove}
      >
        <MaterialSymbol name="close" className="text-[0.65rem] leading-none" />
      </button>
    </span>
  );
}

type TagsSectionProps = {
  readOnly: boolean;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
};

export function TagsSection({
  readOnly,
  tags,
  onTagsChange,
}: TagsSectionProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const commitDraft = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setDraft("");
      return;
    }
    onTagsChange([...tags, trimmed]);
    setDraft("");
  }, [draft, onTagsChange, tags]);

  const handleDraftKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" || event.key === "," || event.key === "Tab") {
        if (draft.trim()) {
          event.preventDefault();
          commitDraft();
        }
        return;
      }
      if (event.key === "Backspace" && draft.length === 0 && tags.length > 0) {
        event.preventDefault();
        onTagsChange(tags.slice(0, -1));
      }
    },
    [commitDraft, draft, onTagsChange, tags],
  );

  const draftTone = tagTone(tags.length);
  const isDrafting = draft.length > 0;

  return (
    <section className="relative flex w-full shrink-0 flex-col gap-2">
      <span className={inspectorSectionLabelClassName}>Tags</span>
      {readOnly ? (
        tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Pill key={tagKey(tag, index)} tone={tagTone(index)} size="sm">
                {tag}
              </Pill>
            ))}
          </div>
        ) : (
          <p className="text-sm text-wn-mono-500">No tags yet.</p>
        )
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag, index) => (
            <RemovableTagPill
              key={tagKey(tag, index)}
              tag={tag}
              tone={tagTone(index)}
              onRemove={() =>
                onTagsChange(tags.filter((_, tagIndex) => tagIndex !== index))
              }
            />
          ))}
          <input
            ref={inputRef}
            type="text"
            value={draft}
            aria-label="Add tag"
            placeholder={tags.length === 0 ? "Add tag…" : undefined}
            className={cx(
              "max-w-56 shrink-0 border-0 font-semibold outline-none transition-[width,padding,background-color]",
              isDrafting
                ? cx(
                    "rounded-full px-2 py-0.5 text-xs",
                    draftPillToneClassNames[draftTone],
                  )
                : cx(
                    "bg-transparent py-0.5 text-xs font-medium",
                    tags.length === 0
                      ? "min-w-[8ch] text-wn-mono-500 placeholder:text-wn-mono-600"
                      : "w-2 min-w-2 text-wn-mono-50 focus:w-16",
                  ),
            )}
            style={
              isDrafting
                ? { width: `${Math.max(draft.length, 2)}ch` }
                : undefined
            }
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleDraftKeyDown}
            onBlur={commitDraft}
          />
        </div>
      )}
    </section>
  );
}
