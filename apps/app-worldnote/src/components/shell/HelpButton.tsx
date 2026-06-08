import { Button, MaterialSymbol, Tooltip } from "@worldnote/ui";
import { WORLDNOTE_DOCS_URL } from "../../constants/urls.js";
import { openExternalUrl } from "../../services/desktop/openExternalUrl.js";

/** Floating docs link shown on Home and Settings. */
export function HelpButton() {
  return (
    <div className="pointer-events-none fixed right-6 bottom-6 z-30">
      <Tooltip content="Documentation" placement="top">
        <span className="pointer-events-auto inline-flex">
          <Button
            isIconOnly
            variant="secondary"
            size="sm"
            aria-label="Open documentation"
            className="shadow-lg backdrop-blur-sm"
            onPress={() => {
              void openExternalUrl(WORLDNOTE_DOCS_URL);
            }}
          >
            <MaterialSymbol name="question_mark" className="text-lg" />
          </Button>
        </span>
      </Tooltip>
    </div>
  );
}
