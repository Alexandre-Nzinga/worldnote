import { Input } from "@heroui/react";
import { Pill, type PillTone } from "@worldnote/ui";
import { inspectorInlineInputClassNames, inspectorSectionLabelClassName } from "./inspectorFieldStyles.js";

const TAG_TONES: PillTone[] = [
  "azure",
  "indigo",
  "amber",
  "lime",
  "rose",
  "mono",
];

type TagsSectionProps = {
  readOnly: boolean;
  tags: string[];
  tagsInput: string;
  onTagsInputChange: (value: string) => void;
};

export function TagsSection({
  readOnly,
  tags,
  tagsInput,
  onTagsInputChange,
}: TagsSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <span className={inspectorSectionLabelClassName}>Tags</span>
      {readOnly ? (
        tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Pill
                key={tag}
                tone={TAG_TONES[index % TAG_TONES.length]}
                size="sm"
              >
                {tag}
              </Pill>
            ))}
          </div>
        ) : (
          <p className="text-sm text-wn-mono-500">No tags yet.</p>
        )
      ) : (
        <>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Pill
                  key={tag}
                  tone={TAG_TONES[index % TAG_TONES.length]}
                  size="sm"
                >
                  {tag}
                </Pill>
              ))}
            </div>
          ) : null}
          <Input
            id="inspector-tags"
            placeholder="hero, faction"
            value={tagsInput}
            onValueChange={onTagsInputChange}
            variant="flat"
            classNames={inspectorInlineInputClassNames}
          />
        </>
      )}
    </section>
  );
}
