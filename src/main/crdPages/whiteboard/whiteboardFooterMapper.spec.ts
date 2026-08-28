import { describe, expect, it } from 'vitest';
import { mapWhiteboardFooterProps } from './whiteboardFooterMapper';

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
});
