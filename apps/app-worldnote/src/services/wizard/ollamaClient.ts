import { Channel, invoke } from "@tauri-apps/api/core";

export const DEFAULT_OLLAMA_HOST = "http://localhost:11434";

/** Ollama model library — users pick and pull any model that fits their machine. */
export const OLLAMA_MODEL_LIBRARY_URL = "https://ollama.com/library";

/** Starting-point model when users are unsure what to pull from Ollama. */
export const SUGGESTED_WIZARD_MODEL = "qwen2.5:7b";

/** Ollama library page for {@link SUGGESTED_WIZARD_MODEL}. */
export const SUGGESTED_WIZARD_MODEL_URL = "https://ollama.com/library/qwen2.5";

export type WizardChatRole = "system" | "user" | "assistant";

export type WizardChatMessage = {
  role: WizardChatRole;
  content: string;
};

/** A single streamed chunk forwarded from the Rust proxy. */
export type ChatChunk = {
  token: string;
  done: boolean;
};

export type StreamWizardChatOptions = {
  host?: string;
  model: string;
  messages: WizardChatMessage[];
  /** Optional JSON schema (Ollama structured outputs) for card generation. */
  format?: unknown;
  onToken?: (token: string, accumulated: string) => void;
  onDone?: (full: string) => void;
  onError?: (error: string) => void;
  signal?: AbortSignal;
};

function resolveHost(host?: string): string {
  const trimmed = host?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : DEFAULT_OLLAMA_HOST;
}

/** Returns true when the local Ollama instance is reachable. */
export async function checkOllamaHealth(host?: string): Promise<boolean> {
  try {
    return await invoke<boolean>("ollama_health", { host: resolveHost(host) });
  } catch {
    return false;
  }
}

/** Lists the model tags installed on the local Ollama instance. */
export async function listOllamaModels(host?: string): Promise<string[]> {
  return invoke<string[]>("ollama_list_models", { host: resolveHost(host) });
}

/**
 * Streams a chat completion from Ollama via the Rust proxy. Resolves with the
 * full assistant message once the stream finishes.
 */
export async function streamWizardChat(
  options: StreamWizardChatOptions,
): Promise<string> {
  const { model, messages, format, onToken, onDone, onError, signal } = options;
  const host = resolveHost(options.host);

  let accumulated = "";
  let settled = false;

  return new Promise<string>((resolve, reject) => {
    const channel = new Channel<ChatChunk>();

    const finish = () => {
      if (settled) return;
      settled = true;
      onDone?.(accumulated);
      resolve(accumulated);
    };

    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      onError?.(message);
      reject(new Error(message));
    };

    channel.onmessage = (chunk) => {
      if (settled) return;
      if (chunk.token) {
        accumulated += chunk.token;
        onToken?.(chunk.token, accumulated);
      }
      if (chunk.done) {
        finish();
      }
    };

    if (signal) {
      if (signal.aborted) {
        fail("Wizard request aborted");
        return;
      }
      signal.addEventListener("abort", () => fail("Wizard request aborted"), {
        once: true,
      });
    }

    invoke<void>("ollama_chat", {
      host,
      model,
      messages,
      format: format ?? null,
      onEvent: channel,
    })
      .then(() => {
        // The stream may already have emitted `done`; otherwise resolve now.
        finish();
      })
      .catch((error: unknown) => {
        fail(error instanceof Error ? error.message : String(error));
      });
  });
}
