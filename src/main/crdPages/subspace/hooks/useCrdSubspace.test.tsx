import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { SidebarWidget, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { useCrdSubspace } from './useCrdSubspace';

type State = { id: string; sortOrder: number; settings: { visible: boolean; sidebar: string[] } };

let subspaceLevel: SpaceLevel = SpaceLevel.L1;
let flowStates: State[] = [];

const useSpaceDashboardNavigation = vi.fn((_args: { spaceId: string | undefined; skip?: boolean }) => ({
  dashboardNavigation: undefined,
  loading: false,
  refetch: () => {},
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useSubspacePageQuery: () => ({
    data: { lookup: { space: { collaboration: { id: 'collab-1', calloutsSet: { id: 'cs-1' } } } } },
    loading: false,
  }),
  useSpaceDefaultTemplatesQuery: () => ({ data: undefined }),
  useInnovationFlowDetailsQuery: () => ({
    data: {
      lookup: {
        collaboration: { innovationFlow: { id: 'flow-1', states: flowStates, currentState: { id: 'b' } } },
      },
    },
    loading: false,
  }),
  useSpaceAboutDetailsQuery: () => ({ data: undefined, loading: false }),
}));

vi.mock('@/domain/space/hooks/useSubSpace', () => ({
  useSubSpace: () => ({
    subspace: {
      id: 'sub-1',
      nameId: 'sub-1',
      level: subspaceLevel,
      about: { profile: { displayName: 'Sub', description: '', url: '/sub' }, membership: undefined },
    },
    parentSpaceId: 'parent-1',
    permissions: { canRead: true, canUpdate: true, canCreateSubspace: true },
    loading: false,
  }),
}));
vi.mock('@/domain/space/context/useSpace', () => ({ useSpace: () => ({ visibility: undefined }) }));
vi.mock('@/domain/space/hooks/useVideoCall', () => ({
  useVideoCall: () => ({ isVideoCallEnabled: false, videoCallUrl: '' }),
}));
vi.mock('@/domain/collaboration/calloutsSet/authorization/useCalloutsSetAuthorization', () => ({
  useCalloutsSetAuthorization: () => ({ canCreateCallout: false, loading: false }),
}));
vi.mock('@/domain/access/ApplicationsAndInvitations/useApplicationButton', () => ({
  default: () => ({ applicationButtonProps: {}, loading: false }),
}));
vi.mock('@/domain/space/components/spaceDashboardNavigation/useSpaceDashboardNavigation', () => ({
  default: (args: { spaceId: string | undefined; skip?: boolean }) => useSpaceDashboardNavigation(args),
}));
vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({
  default: () => ({ levelZeroSpaceId: 'parent-1' }),
}));
vi.mock('../../space/dataMappers/spacePageDataMapper', () => ({ mapSpaceVisibility: () => ({}) }));
vi.mock('../dataMappers/subspacePageDataMapper', () => ({
  mapInnovationFlowPhases: (states: State[]) => states.map(state => ({ id: state.id })),
  mapSubspaceBanner: () => ({ title: 'Sub' }),
  mapSubspaceHeaderActions: () => ({}),
  mapSubspaceSidebar: () => ({ description: '', leads: [] }),
}));

const state = (id: string, sortOrder: number, sidebar: string[], visible = true): State => ({
  id,
  sortOrder,
  settings: { visible, sidebar },
});

describe('useCrdSubspace sidebar plan', () => {
  beforeEach(() => {
    subspaceLevel = SpaceLevel.L1;
    useSpaceDashboardNavigation.mockClear();
  });

  test('renders the first phase list even when that phase is hidden from the tab strip', () => {
    flowStates = [
      state('b', 2, [SidebarWidget.Index]),
      state('a', 1, [SidebarWidget.Community, SidebarWidget.Search], false),
    ];
    const { result } = renderHook(() => useCrdSubspace());
    expect(result.current.firstStateId).toBe('a');
    expect(result.current.sidebarPlan).toEqual(['community', 'search']);
    // The tab strip still drops the hidden phase.
    expect(result.current.phases.map(phase => phase.id)).toEqual(['b']);
  });

  test('an L2 plan drops Create Subspace and Subspaces', () => {
    subspaceLevel = SpaceLevel.L2;
    flowStates = [state('a', 1, [SidebarWidget.Intent, SidebarWidget.CreateSubspace, SidebarWidget.SubspaceLinks])];
    const { result } = renderHook(() => useCrdSubspace());
    expect(result.current.level).toBe('L2');
    expect(result.current.sidebarPlan).toEqual(['intent']);
    expect(result.current.sidebarSkips.subspaceLinks).toBe(true);
  });

  test('skips the nested-subspaces query when subspaceLinks is not configured', () => {
    flowStates = [state('a', 1, [SidebarWidget.Intent])];
    renderHook(() => useCrdSubspace());
    expect(useSpaceDashboardNavigation).toHaveBeenLastCalledWith({ spaceId: 'sub-1', skip: true });
  });

  test('fetches nested subspaces when subspaceLinks is configured on L1', () => {
    flowStates = [state('a', 1, [SidebarWidget.SubspaceLinks])];
    renderHook(() => useCrdSubspace());
    expect(useSpaceDashboardNavigation).toHaveBeenLastCalledWith({ spaceId: 'sub-1', skip: false });
  });

  test('an empty first-phase list yields an empty plan', () => {
    flowStates = [state('a', 1, []), state('b', 2, [SidebarWidget.Index])];
    const { result } = renderHook(() => useCrdSubspace());
    expect(result.current.sidebarPlan).toEqual([]);
  });
});
