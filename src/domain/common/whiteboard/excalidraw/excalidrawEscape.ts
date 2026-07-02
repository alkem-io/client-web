import type { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/types/excalidraw/types';

/**
 * Handles the Escape key for an Excalidraw instance embedded in a dialog, mirroring the
 * standalone Excalidraw app: Escape first clears the current selection / cancels the active
 * operation, and only closes the surrounding dialog once there is nothing left to clear.
 *
 * It must run before the dialog reacts to Escape. Returns `true` when the Escape was consumed
 * here (so the dialog should stay open) and `false` when there was nothing to handle (so the
 * dialog may close).
 *
 * Why we clear the selection ourselves instead of letting Excalidraw's own handler do it:
 * - When the canvas isn't focused, the keydown's target is the dialog content (an ancestor of
 *   the canvas), so the event never reaches Excalidraw's container key handler at all.
 * - Even when it does reach Excalidraw, its Escape action (`actionFinalize`) re-keeps a plain
 *   selection rather than clearing it.
 * Clearing through the public API is therefore the only reliable way to deselect.
 *
 * @param event the Escape KeyboardEvent, as provided by Radix's capture-phase handler.
 */
export const handleExcalidrawEscape = (
  excalidrawAPI: ExcalidrawImperativeAPI | null,
  event: KeyboardEvent
): boolean => {
  if (!excalidrawAPI) {
    return false;
  }

  const appState = excalidrawAPI.getAppState();

  const hasSelection =
    Object.keys(appState.selectedElementIds ?? {}).length > 0 ||
    Object.keys(appState.selectedGroupIds ?? {}).length > 0 ||
    appState.editingGroupId != null ||
    appState.selectedLinearElement != null;

  if (hasSelection) {
    // Stop the event here so Excalidraw doesn't also process it and re-keep the selection.
    event.stopPropagation();
    excalidrawAPI.updateScene({
      appState: {
        selectedElementIds: {},
        selectedGroupIds: {},
        editingGroupId: null,
        selectedLinearElement: null,
      },
    });
    return true;
  }

  // Mid-edit / mid-draw: let Excalidraw finalize the operation (the key reaches the active text
  // editor / canvas directly, so we must NOT stop propagation) while keeping the dialog open.
  const isEditingOrDrawing =
    appState.editingTextElement != null ||
    appState.editingLinearElement != null ||
    appState.newElement != null ||
    appState.multiElement != null ||
    appState.croppingElementId != null;

  return isEditingOrDrawing;
};
