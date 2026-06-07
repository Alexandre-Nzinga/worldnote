import { CARD_IMAGE_EXTENSIONS } from "../desktop/saveCardImage.js";

const IMAGE_EXTENSIONS = new Set<string>(CARD_IMAGE_EXTENSIONS);

export function isImagePath(filePath: string): boolean {
  const normalized = filePath.trim().replace(/\\/g, "/");
  const name = normalized.split("/").pop() ?? normalized;
  const dot = name.lastIndexOf(".");
  if (dot < 0) {
    return false;
  }
  const ext = name.slice(dot + 1).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
}

export function filterImagePaths(paths: string[]): string[] {
  return paths.filter(isImagePath);
}

export function isImageMimeType(mime: string): boolean {
  return mime.startsWith("image/");
}

export function isImageFile(file: File): boolean {
  if (file.type && isImageMimeType(file.type)) {
    return true;
  }
  return isImagePath(file.name);
}

export function localPathFromFile(file: File): string | null {
  if (!("path" in file)) {
    return null;
  }
  const path = file.path;
  return typeof path === "string" && path.length > 0 ? path : null;
}

/** True when a drag event likely carries OS files (Explorer, browser, etc.). */
export function dragHasExternalFiles(dataTransfer: DataTransfer): boolean {
  const types = Array.from(dataTransfer.types).map((type) =>
    type.toLowerCase(),
  );
  if (types.includes("files")) {
    return true;
  }
  return dataTransfer.items
    ? Array.from(dataTransfer.items).some((item) => item.kind === "file")
    : false;
}

export function imageFilesFromDataTransfer(dataTransfer: DataTransfer): File[] {
  return Array.from(dataTransfer.files).filter(isImageFile);
}
