use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::ipc::Channel;

const DEFAULT_HOST: &str = "http://localhost:11434";

fn normalize_host(host: &str) -> String {
    let trimmed = host.trim().trim_end_matches('/');
    if trimmed.is_empty() {
        DEFAULT_HOST.to_string()
    } else {
        trimmed.to_string()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatChunk {
    pub token: String,
    pub done: bool,
}

#[derive(Deserialize)]
struct TagsResponse {
    #[serde(default)]
    models: Vec<TagModel>,
}

#[derive(Deserialize)]
struct TagModel {
    name: String,
}

/// Returns true when the local Ollama instance answers on `/api/tags`.
#[tauri::command]
pub async fn ollama_health(host: String) -> Result<bool, String> {
    let base = normalize_host(&host);
    let client = reqwest::Client::new();
    match client.get(format!("{base}/api/tags")).send().await {
        Ok(resp) => Ok(resp.status().is_success()),
        Err(_) => Ok(false),
    }
}

/// Lists the model tags installed on the local Ollama instance.
#[tauri::command]
pub async fn ollama_list_models(host: String) -> Result<Vec<String>, String> {
    let base = normalize_host(&host);
    let client = reqwest::Client::new();
    let resp = client
        .get(format!("{base}/api/tags"))
        .send()
        .await
        .map_err(|error| error.to_string())?;

    if !resp.status().is_success() {
        return Err(format!("Ollama returned status {}", resp.status()));
    }

    let parsed: TagsResponse = resp.json().await.map_err(|error| error.to_string())?;
    Ok(parsed.models.into_iter().map(|model| model.name).collect())
}

fn extract_chunk(value: &Value) -> ChatChunk {
    let token = value
        .get("message")
        .and_then(|message| message.get("content"))
        .and_then(|content| content.as_str())
        .unwrap_or("")
        .to_string();
    let done = value
        .get("done")
        .and_then(|done| done.as_bool())
        .unwrap_or(false);
    ChatChunk { token, done }
}

/// Streams a chat completion from Ollama, forwarding each NDJSON chunk through
/// the provided channel. `format` carries an optional JSON schema (Ollama
/// structured outputs) used for card generation.
#[tauri::command]
pub async fn ollama_chat(
    host: String,
    model: String,
    messages: Vec<ChatMessage>,
    format: Option<Value>,
    on_event: Channel<ChatChunk>,
) -> Result<(), String> {
    let base = normalize_host(&host);
    let client = reqwest::Client::new();

    let mut body = serde_json::json!({
        "model": model,
        "messages": messages,
        "stream": true,
    });
    if let Some(fmt) = format {
        body["format"] = fmt;
    }

    let resp = client
        .post(format!("{base}/api/chat"))
        .json(&body)
        .send()
        .await
        .map_err(|error| error.to_string())?;

    if !resp.status().is_success() {
        let status = resp.status();
        let text = resp.text().await.unwrap_or_default();
        return Err(format!("Ollama chat failed ({status}): {text}"));
    }

    let mut stream = resp.bytes_stream();
    let mut buffer = String::new();

    while let Some(chunk) = stream.next().await {
        let bytes = chunk.map_err(|error| error.to_string())?;
        buffer.push_str(&String::from_utf8_lossy(&bytes));

        while let Some(newline_idx) = buffer.find('\n') {
            let line: String = buffer.drain(..=newline_idx).collect();
            let line = line.trim();
            if line.is_empty() {
                continue;
            }
            let Ok(value) = serde_json::from_str::<Value>(line) else {
                continue;
            };
            let chunk = extract_chunk(&value);
            let done = chunk.done;
            on_event.send(chunk).map_err(|error| error.to_string())?;
            if done {
                return Ok(());
            }
        }
    }

    let remaining = buffer.trim();
    if !remaining.is_empty() {
        if let Ok(value) = serde_json::from_str::<Value>(remaining) {
            let mut chunk = extract_chunk(&value);
            chunk.done = true;
            let _ = on_event.send(chunk);
        }
    }

    Ok(())
}
