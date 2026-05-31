import { Input, Textarea } from "@heroui/react";
import { getBodyTextStyle, Pill, type PillTone } from "@worldnote/ui";
import {
  inspectorInlineInputClassNames,
  inspectorSectionLabelClassName,
  inspectorTextareaClassNames,
} from "./inspectorFieldStyles.js";

const TAG_TONES: PillTone[] = [
  "azure",
  "indigo",
  "amber",
  "lime",
  "rose",
  "mono",
];

type InfoTabProps = {
  readOnly: boolean;
  description: string;
  tags: string[];
  tagsInput: string;
  onDescriptionChange: (value: string) => void;
  onTagsInputChange: (value: string) => void;
};

export function InfoTab({
  readOnly,
  description,
  tags,
  tagsInput,
  onDescriptionChange,
  onTagsInputChange,
}: InfoTabProps) {
  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-2">
        <span className={inspectorSectionLabelClassName}>Description</span>
        {readOnly ? (
          description.trim() ? (
            <p
              className="whitespace-pre-wrap text-wn-mono-200"
              style={getBodyTextStyle("body")}
            >
              {description}
            </p>
          ) : (
            <p className="text-sm text-wn-mono-500">No description yet.</p>
          )
        ) : (
          <Textarea
            id="inspector-description"
            minRows={3}
            placeholder="Short description of this card…"
            value={description}
            onValueChange={onDescriptionChange}
            variant="flat"
            classNames={inspectorTextareaClassNames}
          />
        )}
      </section>

      <section className="flex flex-col gap-2">
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
    </div>
  );
}
