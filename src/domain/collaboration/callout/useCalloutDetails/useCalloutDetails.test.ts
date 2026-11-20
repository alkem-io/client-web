/** @vitest-environment jsdom */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CalloutFramingType, CalloutVisibility } from '@/core/apollo/generated/graphql-schema';

const harness = vi.hoisted(() => ({
  framingType: 'NONE' as string,
  canSaveAsTemplate: true,
  entitledToSaveAsTemplate: true,
}));

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ state: undefined }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCalloutDetailsQuery: () => ({
    data: {
      lookup: {
        callout: {
          id: 'callout-1',
          settings: { visibility: CalloutVisibility.Published },
          authorization: { myPrivileges: [] },
          framing: { type: harness.framingType },
        },
      },
    },
    loading: false,
    refetch: vi.fn(),
    error: undefined,
  }),
}));

vi.mock('@/domain/space/hooks/useSpacePermissionsAndEntitlements', () => ({
  default: () => ({
    permissions: { canSaveAsTemplate: harness.canSaveAsTemplate },
    entitlements: { entitledToSaveAsTemplate: harness.entitledToSaveAsTemplate },
  }),
}));

vi.mock('../../calloutsSet/authorization/useCalloutsSetAuthorization', () => ({
  useCalloutsSetAuthorization: () => ({ canMoveCallouts: false }),
}));

import useCalloutDetails from './useCalloutDetails';

const render = () =>
  renderHook(() => useCalloutDetails({ calloutId: 'callout-1', calloutsSetId: 'set-1', withClassification: false }))
    .result.current.callout;

describe('useCalloutDetails — save as template', () => {
  beforeEach(() => {
    harness.canSaveAsTemplate = true;
    harness.entitledToSaveAsTemplate = true;
  });

  it.each([
    CalloutFramingType.Poll,
    CalloutFramingType.Form,
    CalloutFramingType.None,
  ])('offers "Save as template" for a %s Post when the space allows it', framingType => {
    harness.framingType = framingType;
    expect(render()?.canBeSavedAsTemplate).toBe(true);
  });

  it.each([
    CalloutFramingType.Poll,
    CalloutFramingType.Form,
  ])('follows the space flag for a %s Post: no permission, no offer', framingType => {
    harness.framingType = framingType;
    harness.canSaveAsTemplate = false;
    expect(render()?.canBeSavedAsTemplate).toBe(false);
  });

  it('follows the entitlement for a Form Post', () => {
    harness.framingType = CalloutFramingType.Form;
    harness.entitledToSaveAsTemplate = false;
    expect(render()?.canBeSavedAsTemplate).toBe(false);
  });
});
