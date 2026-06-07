import { CARD_TYPE_LABELS, type WorldCard } from "@worldnote/shared";
import { MaterialSymbol } from "@worldnote/ui";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  primaryAccentFillClassName,
  primaryAccentInteractiveClassName,
} from "../../../services/settings/primaryAccentStyles.js";
import { MarkdownView } from "../inspector/MarkdownView.js";
import { cx } from "./cx.js";
import type { WizardMessage as WizardMessageData } from "./useWorldWizard.js";

const STATIC_LOADING_LABELS: Record<string, string> = {
  "Generating card…": "Generating card",
  "Updating card…": "Updating card",
};

function resolveLoadingLabel(message: WizardMessageData): string | undefined {
  if (message.loadingLabel) {
    return message.loadingLabel;
  }
  if (message.streaming) {
    return STATIC_LOADING_LABELS[message.content];
  }
  return undefined;
}

function WizardTypingIndicator({ label }: { label?: string }) {
  return (
    <output
      className="flex items-center gap-1.5 py-0.5"
      aria-label={label ?? "Generating response"}
    >
      {label ? (
        <span className="text-sm text-wn-mono-200">{label}</span>
      ) : null}
      <span className="flex items-center gap-1" aria-hidden={label ? true : undefined}>
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="inline-block h-1.5 w-1.5 rounded-full bg-wn-mono-400"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
            transition={{
              duration: 0.9,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: index * 0.15,
            }}
          />
        ))}
      </span>
    </output>
  );
}

function WizardStreamCursor() {
  return (
    <span
      className="ml-0.5 inline-block h-[1em] w-[0.35em] animate-pulse bg-wn-mono-400 align-text-bottom"
      aria-hidden
    />
  );
}

function WizardMessageCopyButton({
  text,
  variant,
}: {
  text: string;
  variant: "user" | "assistant";
}) {
  const [copied, setCopied] = useState(false);
  const resetCopiedRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetCopiedRef.current !== null) {
        window.clearTimeout(resetCopiedRef.current);
      }
    };
  }, []);

  const copy = useCallback(async () => {
    if (!text.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (resetCopiedRef.current !== null) {
        window.clearTimeout(resetCopiedRef.current);
      }
      resetCopiedRef.current = window.setTimeout(() => {
        setCopied(false);
        resetCopiedRef.current = null;
      }, 1500);
    } catch {
      // Clipboard access can fail in some environments; ignore silently.
    }
  }, [text]);

  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : "Copy message"}
      title={copied ? "Copied" : "Copy message"}
      onClick={() => void copy()}
      className={cx(
        "absolute right-1.5 top-1.5 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100",
        variant === "user"
          ? "text-wn-primary-foreground/70 hover:bg-wn-primary-hover hover:text-wn-primary-foreground"
          : "text-wn-mono-400 hover:bg-wn-mono-700 hover:text-wn-mono-50",
      )}
    >
      <MaterialSymbol
        name={copied ? "check" : "content_copy"}
        className="text-sm"
      />
    </button>
  );
}

type WizardMessageProps = {
  message: WizardMessageData;
  onSpawn: (card: WorldCard) => void;
  onApply?: (card: WorldCard) => void;
};

function GeneratedCardPreview({
  card,
  action,
  onSpawn,
  onApply,
}: {
  card: WorldCard;
  action: "spawn" | "apply";
  onSpawn: (card: WorldCard) => void;
  onApply?: (card: WorldCard) => void;
}) {
  const typeLabel = CARD_TYPE_LABELS[card.card_type] ?? card.card_type;
  const isApply = action === "apply";
  return (
    <div className="mt-2 rounded-xl border border-wn-mono-700 bg-wn-mono-950 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-wn-mono-50">
            {card.name}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-wn-mono-500">
            {typeLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={() =>
            isApply ? onApply?.(card) : onSpawn(card)
          }
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${primaryAccentInteractiveClassName}`}
        >
          <MaterialSymbol
            name={isApply ? "check_circle" : "add_circle"}
            className="text-sm"
          />
          {isApply ? "Apply to card" : "Spawn onto Canvas"}
        </button>
      </div>
      {card.description ? (
        <p className="mt-2 text-xs leading-relaxed text-wn-mono-300">
          {card.description}
        </p>
      ) : null}
    </div>
  );
}

export function WizardMessage({
  message,
  onSpawn,
  onApply,
}: WizardMessageProps) {
  const isUser = message.role === "user";
  const loadingLabel = resolveLoadingLabel(message);
  const canCopy = !message.streaming && message.content.trim().length > 0;

  return (
    <div className={cx("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cx(
          "group relative max-w-[90%] rounded-2xl px-3 py-2 text-sm",
          canCopy && "pr-8",
          isUser
            ? primaryAccentFillClassName
            : message.error
              ? "border border-wn-red-500/60 bg-wn-red-500/10 text-wn-red-300"
              : "bg-wn-mono-800 text-wn-mono-100",
        )}
      >
        {canCopy ? (
          <WizardMessageCopyButton
            text={message.content}
            variant={isUser ? "user" : "assistant"}
          />
        ) : null}
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <>
            {message.streaming && (loadingLabel || !message.content.trim()) ? (
              <WizardTypingIndicator label={loadingLabel} />
            ) : message.streaming ? (
              <output
                className="block whitespace-pre-wrap leading-relaxed text-wn-mono-200"
                aria-label="Generating response"
              >
                {message.content}
                <WizardStreamCursor />
              </output>
            ) : message.content.trim() ? (
              <MarkdownView content={message.content} />
            ) : null}
            {message.generatedCard ? (
              <GeneratedCardPreview
                card={message.generatedCard}
                action={message.generatedCardAction ?? "spawn"}
                onSpawn={onSpawn}
                onApply={onApply}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
