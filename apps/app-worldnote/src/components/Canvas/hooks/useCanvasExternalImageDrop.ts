import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useReactFlow, useStoreApi } from "@xyflow/react";
import { useEffect, useRef } from "react";

import {
  dragHasExternalFiles,
  filterImagePaths,
  imageFilesFromDataTransfer,
  isImageFile,
  localPathFromFile,
} from "../../../services/canvas/canvasImageDrop.js";
import { saveCanvasImageBytes } from "../../../services/desktop/saveCanvasImage.js";
import { isTauriRuntime } from "../../../services/desktop/tauriRuntime.js";

export type CanvasImageDropPosition = {
  x: number;
  y: number;
};

export type CanvasImageImportOptions = {
  imageId?: string;
  /** Image already copied into the vault; skip saveCanvasImage. */
  storedImagePath?: string;
  /** Place at the center of the visible canvas (e.g. toolbar image tool). */
  preferViewportCenter?: boolean;
};

type UseCanvasExternalImageDropOptions = {
  enabled: boolean;
  vaultPath: string | null;
  onImportImage: (
    sourcePath: string,
    flowPosition: CanvasImageDropPosition,
    options?: CanvasImageImportOptions,
  ) => Promise<void>;
};

async function tauriDropToClientPosition(
  physicalX: number,
  physicalY: number,
): Promise<CanvasImageDropPosition> {
  const webview = getCurrentWebviewWindow();
  const factor = await webview.scaleFactor();
  return {
    x: physicalX / factor,
    y: physicalY / factor,
  };
}

function offsetForImageIndex(
  base: CanvasImageDropPosition,
  index: number,
): CanvasImageDropPosition {
  return {
    x: base.x - 80 + index * 28,
    y: base.y - 60 + index * 24,
  };
}

/** OS / browser file drops onto the canvas (inside ReactFlowProvider). */
export function useCanvasExternalImageDrop({
  enabled,
  vaultPath,
  onImportImage,
}: UseCanvasExternalImageDropOptions) {
  const { screenToFlowPosition } = useReactFlow();
  const store = useStoreApi();
  const onImportRef = useRef(onImportImage);
  onImportRef.current = onImportImage;

  useEffect(() => {
    if (!enabled || !vaultPath) {
      return;
    }

    const importAtClient = async (
      paths: string[],
      client: CanvasImageDropPosition,
    ) => {
      const imagePaths = filterImagePaths(paths);
      if (imagePaths.length === 0) {
        return;
      }
      const flow = screenToFlowPosition(client);
      for (let index = 0; index < imagePaths.length; index += 1) {
        const path = imagePaths[index];
        if (path) {
          await onImportRef.current(path, offsetForImageIndex(flow, index));
        }
      }
    };

    const importFilesAtClient = async (
      files: File[],
      client: CanvasImageDropPosition,
    ) => {
      const imageFiles = files.filter(isImageFile);
      if (imageFiles.length === 0) {
        return;
      }

      const flow = screenToFlowPosition(client);
      for (let index = 0; index < imageFiles.length; index += 1) {
        const file = imageFiles[index];
        if (!file) {
          continue;
        }

        const localPath = localPathFromFile(file);
        if (localPath && isTauriRuntime()) {
          await onImportRef.current(localPath, offsetForImageIndex(flow, index));
          continue;
        }

        if (!isTauriRuntime()) {
          continue;
        }

        const imageId = crypto.randomUUID();
        const storedImagePath = await saveCanvasImageBytes(
          vaultPath,
          imageId,
          file.name,
          await file.arrayBuffer(),
        );
        await onImportRef.current(file.name, offsetForImageIndex(flow, index), {
          imageId,
          storedImagePath,
        });
      }
    };

    const unlisteners: Array<() => void> = [];

    if (isTauriRuntime()) {
      void getCurrentWebviewWindow()
        .onDragDropEvent((event) => {
          const payload = event.payload;
          if (payload.type !== "drop") {
            return;
          }
          void tauriDropToClientPosition(
            payload.position.x,
            payload.position.y,
          ).then((client) => importAtClient(payload.paths, client));
        })
        .then((unlisten) => {
          unlisteners.push(unlisten);
        });
    }

    const domCleanups: Array<() => void> = [];

    const onDragOver = (event: DragEvent) => {
      const transfer = event.dataTransfer;
      if (!transfer || !dragHasExternalFiles(transfer)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      transfer.dropEffect = "copy";
    };

    const onDrop = (event: DragEvent) => {
      const transfer = event.dataTransfer;
      if (!transfer || !dragHasExternalFiles(transfer)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();

      const client = { x: event.clientX, y: event.clientY };
      const paths = filterImagePaths(
        Array.from(transfer.files)
          .map(localPathFromFile)
          .filter((path): path is string => Boolean(path)),
      );

      if (paths.length > 0) {
        void importAtClient(paths, client);
        return;
      }

      void importFilesAtClient(imageFilesFromDataTransfer(transfer), client);
    };

    const attachDomListeners = () => {
      const domNode = store.getState().domNode;
      if (!domNode || domNode.dataset.wnExternalImageDrop === "1") {
        return;
      }
      domNode.dataset.wnExternalImageDrop = "1";
      domNode.addEventListener("dragover", onDragOver);
      domNode.addEventListener("drop", onDrop);
      const detach = () => {
        domNode.removeEventListener("dragover", onDragOver);
        domNode.removeEventListener("drop", onDrop);
        delete domNode.dataset.wnExternalImageDrop;
      };
      domCleanups.push(detach);
    };

    attachDomListeners();
    const unsubscribe = store.subscribe(attachDomListeners);

    return () => {
      unsubscribe();
      for (const unlisten of unlisteners) {
        unlisten();
      }
      for (const detach of domCleanups) {
        detach();
      }
    };
  }, [enabled, screenToFlowPosition, store, vaultPath]);
}
