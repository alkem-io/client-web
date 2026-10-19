import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { CalloutDescriptionDisplayMode, SidebarWidget } from '@/core/apollo/generated/graphql-schema';
import { useColumnMenu } from './useColumnMenu';

const updateFlowStateSettings = vi.fn(async (_options: { variables: { settings: Record<string, unknown> } }) => ({}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  refetchInnovationFlowSettingsQuery: (variables: unknown) => ({ query: 'InnovationFlowSettings', variables }),
  useRemoveDefaultCalloutTemplateOnInnovationFlowStateMutation: () => [vi.fn()],
  useSetDefaultCalloutTemplateOnInnovationFlowStateMutation: () => [vi.fn()],
  useUpdateCalloutFlowStateMutation: () => [vi.fn()],
  useUpdateInnovationFlowCurrentStateMutation: () => [vi.fn()],
  useUpdateInnovationFlowStateMutation: () => [vi.fn()],
  useUpdateInnovationFlowStateSettingsMutation: () => [updateFlowStateSettings],
}));

const renderColumnMenu = (includeSidebar: boolean) =>
  renderHook(() =>
    useColumnMenu({
      innovationFlowId: 'flow-1',
      collaborationId: 'collab-1',
      onOpenDefaultCalloutTemplatePicker: vi.fn(),
      callouts: [],
      columnNames: [],
      innovationFlowStates: [{ id: 'state-1' }],
      includeSidebar,
    })
  ).result.current;

const layout = {
  descriptionCollapsed: true,
  showPublishDetails: false,
  sidebar: ['intent' as const, 'search' as const],
  sidebarUnknown: [{ index: 1, value: 'FUTURE_WIDGET' }],
};

const savedSettings = () => updateFlowStateSettings.mock.calls[0][0].variables.settings;

describe('useColumnMenu onSaveLayout', () => {
  beforeEach(() => {
    updateFlowStateSettings.mockClear();
  });

  test('on subspaces (includeSidebar=false) the settings payload has no sidebar key', async () => {
    await renderColumnMenu(false).onSaveLayout('state-1', layout);

    expect(updateFlowStateSettings).toHaveBeenCalledOnce();
    expect(savedSettings()).not.toHaveProperty('sidebar');
    expect(savedSettings()).toEqual({
      descriptionDisplayMode: CalloutDescriptionDisplayMode.Collapsed,
      showPublishDetails: false,
    });
  });

  test('on top-level Spaces (includeSidebar=true) the sidebar is written, unknown values carried', async () => {
    await renderColumnMenu(true).onSaveLayout('state-1', layout);

    expect(savedSettings()).toEqual({
      descriptionDisplayMode: CalloutDescriptionDisplayMode.Collapsed,
      showPublishDetails: false,
      sidebar: [SidebarWidget.Intent, 'FUTURE_WIDGET', SidebarWidget.Search],
    });
  });

  test('rejects when the target state no longer exists', async () => {
    await expect(renderColumnMenu(false).onSaveLayout('missing', layout)).rejects.toThrow();
    expect(updateFlowStateSettings).not.toHaveBeenCalled();
  });
});
