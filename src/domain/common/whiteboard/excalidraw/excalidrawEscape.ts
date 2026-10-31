import type { ExcalidrawImperativeAPI } from '@excalidraw-yjs/excalidraw/types';

/**
 * Whether the Escape was dispatched inside the Excalidraw container, so its key handler sees it.
 * The editor is mounted without `handleKeyboardGlobally`, so that handler sits on the container.
 */
const reachesExcalidraw = (event: KeyboardEvent): boolean =>
  event.target instanceof Element && event.target.closest('.excalidraw-container') !== null;

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
 * The same goes for an armed tool and for an unfinished operation whenever the Escape does not
 * originate inside the Excalidraw container: the app shell's Back button dispatches its Escape on
 * `document.body`, and keyboard focus may sit on the dialog chrome. Each press must then change
 * something visible through the API, otherwise it is consumed with no effect and Back is trapped.
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

  // Text being typed or an operation in progress: keep the dialog open and end it first.
  // This MUST be checked before the selection: a brand-new element (e.g. text-tool text) stays in
  // `selectedElementIds` while it is still being edited — Excalidraw's pointer-up handler
  // re-selects the element it just created even though the wysiwyg editor is open. Treating that
  // phantom selection as "something to clear" would stop propagation and block the text editor
  // from ever seeing the Escape.
  //
  // The wysiwyg editor finishes the text on its own Escape, so we must NOT stop propagation. An
  // Escape dispatched outside the editor cannot finish it and the API offers no way to: the dialog
  // stays open and the user taps out of the text first.
  if (appState.editingTextElement != null) {
    return true;
  }

  const isDrawing =
    // The @excalidraw-yjs fork (upstream 0.18.x) folded the old `editingLinearElement` into
    // `selectedLinearElement` (a LinearElementEditor carrying its own `isEditing` flag). Checked
    // before the selection branch so a linear element mid-point-edit finalizes instead of clearing.
    appState.selectedLinearElement?.isEditing === true ||
    appState.newElement != null ||
    appState.multiElement != null ||
    appState.croppingElementId != null;

  if (isDrawing) {
    // Excalidraw's own Escape handling finalizes the operation when the key reaches its container.
    if (reachesExcalidraw(event)) {
      return true;
    }
    // Otherwise end the operation here. The element drawn so far stays in the scene as it is.
    excalidrawAPI.updateScene({
      appState: {
        newElement: null,
        multiElement: null,
        croppingElementId: null,
        selectedLinearElement: appState.selectedLinearElement
          ? { ...appState.selectedLinearElement, isEditing: false }
          : null,
      },
    });
    return true;
  }

  // An armed tool other than the selection tool (freedraw, shapes, eraser, hand…): switch back to
  // the selection tool and keep the dialog open. Done through the API because Excalidraw's own
  // Escape handling does not reset an armed tool, and an Escape from outside its container never
  // reaches it. The next Escape, with the selection tool active and nothing selected, falls
  // through and closes the dialog.
  const selectionTool = appState.preferredSelectionTool?.type ?? 'selection';
  if (appState.activeTool.type !== 'selection' && appState.activeTool.type !== selectionTool) {
    excalidrawAPI.setActiveTool({ type: selectionTool });
    return true;
  }

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

  return false;
};
