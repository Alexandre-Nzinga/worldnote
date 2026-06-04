/** Portal target for HeroUI overlays inside modals / native dialogs. */
export function resolveOverlayContainer(
  anchor: HTMLElement | null,
): HTMLElement | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }
  if (anchor) {
    const modalWrapper = anchor.closest('[data-slot="wrapper"]');
    if (modalWrapper instanceof HTMLElement) {
      return modalWrapper;
    }
    const dialog = anchor.closest("dialog");
    if (dialog instanceof HTMLElement) {
      return dialog;
    }
  }
  const openDialog = document.querySelector("dialog[open]");
  if (openDialog instanceof HTMLElement) {
    return openDialog;
  }
  return document.body;
}
