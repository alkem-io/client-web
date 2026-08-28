import { describe, expect, it } from 'vitest';
import { CollaboratorModeReasons } from '@/domain/common/whiteboard/excalidraw/collab/excalidrawAppConstants';
import { mapWhiteboardFooterProps } from '@/main/crdPages/whiteboard/whiteboardFooterMapper';

describe('mapWhiteboardFooterProps reconnect affordance', () => {
  it('offers reconnect after a transient disconnect without changing edit authorization', () => {
    const result = mapWhiteboardFooterProps({
      canEdit: true,
      collaboratorMode: null,
      collaboratorModeReason: null,
      canReconnect: true,
      isAuthenticated: true,
    });

    expect(result.canRestart).toBe(true);
    expect(result.readonlyReason).toBeNull();
  });

  it('offers a read-mode restart only for the explicit inactivity downgrade', () => {
    const base = {
      canEdit: true,
      collaboratorMode: 'read' as const,
      canReconnect: false,
      isAuthenticated: true,
    };

    expect(
      mapWhiteboardFooterProps({
        ...base,
        collaboratorModeReason: null,
      }).canRestart
    ).toBe(false);
    expect(
      mapWhiteboardFooterProps({
        ...base,
        collaboratorModeReason: CollaboratorModeReasons.ROOM_CAPACITY_REACHED,
      }).canRestart
    ).toBe(false);
    expect(
      mapWhiteboardFooterProps({
        ...base,
        collaboratorModeReason: CollaboratorModeReasons.INACTIVITY,
      }).canRestart
    ).toBe(true);
  });
});
