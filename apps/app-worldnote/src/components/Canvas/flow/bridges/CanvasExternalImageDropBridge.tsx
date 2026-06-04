import {
  useCanvasExternalImageDrop,
  type CanvasImageDropPosition,
  type CanvasImageImportOptions,
} from "../../hooks/useCanvasExternalImageDrop.js";

type CanvasExternalImageDropBridgeProps = {
  enabled: boolean;
  vaultPath: string | null;
  onImportImage: (
    sourcePath: string,
    flowPosition: CanvasImageDropPosition,
    options?: CanvasImageImportOptions,
  ) => Promise<void>;
};

/** Registers OS / browser image drops; must render inside ReactFlowProvider. */
export function CanvasExternalImageDropBridge({
  enabled,
  vaultPath,
  onImportImage,
}: CanvasExternalImageDropBridgeProps) {
  useCanvasExternalImageDrop({ enabled, vaultPath, onImportImage });
  return null;
}
