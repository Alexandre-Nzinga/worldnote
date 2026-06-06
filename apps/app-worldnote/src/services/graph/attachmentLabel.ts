/** Display label for a canvas image-tool upload from its vault-relative path. */
export function attachmentLabelFromPath(imagePath: string): string {
  const normalized = imagePath.replace(/\\/g, "/");
  const segments = normalized.split("/");
  const filename = segments[segments.length - 1];
  return filename && filename.length > 0 ? filename : "Image";
}
