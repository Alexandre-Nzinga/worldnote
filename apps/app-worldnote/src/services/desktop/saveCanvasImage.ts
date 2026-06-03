import { invoke } from "@tauri-apps/api/core";
import {
  CARD_IMAGE_EXTENSIONS,
  pickCardImageFile,
} from "./saveCardImage.js";

export { CARD_IMAGE_EXTENSIONS, pickCardImageFile };

export async function saveCanvasImage(
  vault: string,
  imageId: string,
  sourcePath: string,
): Promise<string> {
  return invoke<string>("save_canvas_image", {
    vault,
    imageId,
    sourcePath,
  });
}

export async function saveCanvasImageBytes(
  vault: string,
  imageId: string,
  fileName: string,
  bytes: ArrayBuffer,
): Promise<string> {
  return invoke<string>("save_canvas_image_bytes", {
    vault,
    imageId,
    fileName,
    bytes: Array.from(new Uint8Array(bytes)),
  });
}

export async function deleteCanvasImage(
  vault: string,
  imageId: string,
): Promise<void> {
  return invoke<void>("delete_canvas_image", { vault, imageId });
}
