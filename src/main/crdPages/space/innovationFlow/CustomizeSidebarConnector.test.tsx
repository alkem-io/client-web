import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { SidebarWidget } from '@/core/apollo/generated/graphql-schema';
import { CustomizeSidebarConnector, type CustomizeSidebarConnectorProps } from './CustomizeSidebarConnector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts?.widget ? `${key}:${String(opts.widget)}` : key),
  }),
}));

const updateFlowStateSettings = vi.fn(async (_options: unknown) => ({}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  refetchInnovationFlowSettingsQuery: (variables: unknown) => ({ query: 'InnovationFlowSettings', variables }),
  useUpdateInnovationFlowStateSettingsMutation: () => [updateFlowStateSettings],
}));

const A1 = 'a1000000-0000-4000-8000-000000000001';
const B2 = 'b2000000-0000-4000-8000-000000000002';
const C3 = 'c3000000-0000-4000-8000-000000000003';

type States = NonNullable<CustomizeSidebarConnectorProps['innovationFlowStates']>;

const state = (id: string, sortOrder: number, sidebar: string[]) => ({ id, sortOrder, settings: { sidebar } });

const widgetCheckbox = (widget: string) =>
  screen.queryByRole('checkbox', {
    name: `layout.column.sidebarDialog.toggleAriaLabel:layout.column.sidebarDialog.widgets.${widget}`,
  });

const renderConnector = (innovationFlowStates: States | undefined, level: 'L1' | 'L2' = 'L1') =>
  render(
    <CustomizeSidebarConnector collaborationId="collab-1" innovationFlowStates={innovationFlowStates} level={level} />
  );

const openDialog = () => userEvent.click(screen.getByRole('button', { name: 'layout.customizeSidebar.button' }));
const save = () => userEvent.click(screen.getByRole('button', { name: 'layout.column.phaseLayout.save' }));
const savedVariables = () =>
  (updateFlowStateSettings.mock.calls[0][0] as { variables: { innovationFlowStateId: string; settings: object } })
    .variables;

describe('CustomizeSidebarConnector', () => {
  beforeEach(() => {
    updateFlowStateSettings.mockClear();
  });

  test('targets the lowest (sortOrder, id) state regardless of the array order', async () => {
    // B2 and A1 share sortOrder 10; A1 wins the id tiebreak even though it comes second.
    renderConnector([
      state(C3, 20, [SidebarWidget.Events]),
      state(B2, 10, [SidebarWidget.Index]),
      state(A1, 10, [SidebarWidget.Community]),
    ]);
    await openDialog();
    expect(widgetCheckbox('community')).toBeChecked();
    expect(widgetCheckbox('index')).not.toBeChecked();

    await save();
    await waitFor(() => expect(updateFlowStateSettings).toHaveBeenCalledOnce());
    expect(savedVariables().innovationFlowStateId).toBe(A1);
  });

  test('saves ONLY the sidebar key, and refetches the layout settings', async () => {
    renderConnector([state(A1, 1, [SidebarWidget.Intent])]);
    await openDialog();
    await userEvent.click(widgetCheckbox('search') as HTMLElement);
    await save();

    await waitFor(() => expect(updateFlowStateSettings).toHaveBeenCalledOnce());
    expect(savedVariables().settings).toEqual({ sidebar: [SidebarWidget.Intent, SidebarWidget.Search] });
    expect(updateFlowStateSettings.mock.calls[0][0]).toMatchObject({
      refetchQueries: [{ query: 'InnovationFlowSettings', variables: { collaborationId: 'collab-1' } }],
    });
  });

  test('on L2 hides Create Subspace and Subspaces, and re-inserts them at their indices on save', async () => {
    renderConnector(
      [
        state(A1, 1, [
          SidebarWidget.Intent,
          SidebarWidget.CreateSubspace,
          SidebarWidget.SubspaceLinks,
          SidebarWidget.Index,
        ]),
      ],
      'L2'
    );
    await openDialog();
    expect(widgetCheckbox('createSubspace')).not.toBeInTheDocument();
    expect(widgetCheckbox('subspaceLinks')).not.toBeInTheDocument();

    await userEvent.click(widgetCheckbox('search') as HTMLElement);
    await save();

    await waitFor(() => expect(updateFlowStateSettings).toHaveBeenCalledOnce());
    expect(savedVariables().settings).toEqual({
      sidebar: [
        SidebarWidget.Intent,
        SidebarWidget.CreateSubspace,
        SidebarWidget.SubspaceLinks,
        SidebarWidget.Index,
        SidebarWidget.Search,
      ],
    });
  });

  test('carries top-level-only and unknown values through an L1 save', async () => {
    renderConnector([state(A1, 1, [SidebarWidget.Intent, SidebarWidget.ApplicationButton, 'ZZZ'])]);
    await openDialog();
    expect(widgetCheckbox('applicationButton')).not.toBeInTheDocument();
    await save();

    await waitFor(() => expect(updateFlowStateSettings).toHaveBeenCalledOnce());
    expect(savedVariables().settings).toEqual({
      sidebar: [SidebarWidget.Intent, SidebarWidget.ApplicationButton, 'ZZZ'],
    });
  });

  test('offers the thirteen L1 widgets', async () => {
    renderConnector([state(A1, 1, [])]);
    await openDialog();
    expect(screen.getAllByRole('checkbox')).toHaveLength(13);
  });

  test('saves to the state that is first when saving, not the one that was first when opened', async () => {
    const { rerender } = renderConnector([state(A1, 1, [SidebarWidget.Intent]), state(B2, 2, [SidebarWidget.Index])]);
    await openDialog();
    // A reorder that was already in flight lands while the dialog is open: B2 is now first and,
    // because subspace lists follow their position, carries the first list.
    rerender(
      <CustomizeSidebarConnector
        collaborationId="collab-1"
        innovationFlowStates={[state(A1, 2, [SidebarWidget.Index]), state(B2, 1, [SidebarWidget.Intent])]}
        level="L1"
      />
    );
    await save();

    await waitFor(() => expect(updateFlowStateSettings).toHaveBeenCalledOnce());
    expect(savedVariables().innovationFlowStateId).toBe(B2);
  });

  test('is disabled while a structural change is in flight', () => {
    render(
      <CustomizeSidebarConnector
        collaborationId="collab-1"
        innovationFlowStates={[state(A1, 1, [])]}
        level="L1"
        busy={true}
      />
    );
    expect(screen.getByRole('button', { name: 'layout.customizeSidebar.button' })).toBeDisabled();
  });

  test('is enabled whenever states are loaded and disabled only without states', () => {
    const { unmount } = renderConnector([state(A1, 1, [])]);
    expect(screen.getByRole('button', { name: 'layout.customizeSidebar.button' })).not.toBeDisabled();
    unmount();
    renderConnector(undefined);
    expect(screen.getByRole('button', { name: 'layout.customizeSidebar.button' })).toBeDisabled();
  });
});
