import { BookOpen, FileText, Layers, LayoutDashboard, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSpaceTabsQuery } from '@/core/apollo/generated/apollo-hooks';
import { filterVisibleStates } from '@/domain/collaboration/InnovationFlow/utils/filterVisibleStates';
import { useSpace } from '@/domain/space/context/useSpace';

export type CrdTabDefinition = {
  index: number;
  label: string;
  description: string;
  icon: ReactNode;
  isCustom: boolean;
};

type UseCrdSpaceTabsProvided = {
  tabs: CrdTabDefinition[];
  defaultTabIndex: number;
  /**
   * Number of sections in the full flow, including hidden ones. Tab indices are original
   * positions in that flow (hidden tabs are dropped from `tabs` but never re-indexed), so
   * consumers must bound section ranges by this — not by `tabs.length`.
   */
  sectionCount: number;
  showSettings: boolean;
};

const tabsDefaultNames: Record<string, 'tabs.dashboard' | 'tabs.community' | 'tabs.subspaces' | 'tabs.knowledgeBase'> =
  {
    dashboard: 'tabs.dashboard',
    community: 'tabs.community',
    subspaces: 'tabs.subspaces',
    'knowledge base': 'tabs.knowledgeBase',
  };

const defaultIcons = [LayoutDashboard, Users, Layers, BookOpen];

export function useCrdSpaceTabs({
  spaceId,
  skip,
}: {
  spaceId: string | undefined;
  skip?: boolean;
}): UseCrdSpaceTabsProvided {
  const { t } = useTranslation('crd-space');
  const { permissions } = useSpace();

  const { data } = useSpaceTabsQuery({
    variables: { spaceId: spaceId! },
    skip: !spaceId || skip,
  });

  // Hidden phases are removed from the live tab strip for everyone, including admins; admins
  // still manage/unhide them in Settings → Layout. UI-only — hidden tabs stay reachable by
  // direct URL. No-op until the server exposes per-phase `visible` (graceful degradation).
  const allStates = data?.lookup.space?.collaboration?.innovationFlow.states ?? [];
  const innovationFlowStates = filterVisibleStates(allStates);
  const currentStateId = data?.lookup.space?.collaboration?.innovationFlow.currentState?.id;

  const tabs: CrdTabDefinition[] = innovationFlowStates.map(state => {
    // Preserve each state's original position in the full flow. The L0 content dispatcher
    // (CrdSpaceTabbedPages) and SpaceTabProvider key Dashboard/Community/Subspaces/custom tabs
    // off this fixed index, so hidden tabs must not shift the indices of the remaining ones.
    const index = allStates.indexOf(state);
    const defaultKey = tabsDefaultNames[state.displayName.toLowerCase()] as
      | 'tabs.dashboard'
      | 'tabs.community'
      | 'tabs.subspaces'
      | 'tabs.knowledgeBase'
      | undefined;
    const label = defaultKey ? String(t(defaultKey)) : state.displayName;
    const IconComponent = index < 4 ? defaultIcons[index] : FileText;

    return {
      index,
      label,
      description: state.description ?? '',
      icon: <IconComponent className="h-4 w-4" />,
      isCustom: index >= 4,
    };
  });

  // Provide defaults only when the space genuinely has no flow states — not when every phase
  // has been hidden (in that case the strip stays empty rather than resurrecting default tabs).
  if (allStates.length === 0) {
    const defaultLabels = ['tabs.dashboard', 'tabs.community', 'tabs.subspaces', 'tabs.knowledgeBase'] as const;
    defaultLabels.forEach((key, index) => {
      const IconComponent = defaultIcons[index];
      tabs.push({
        index,
        label: String(t(key)),
        description: '',
        icon: <IconComponent className="h-4 w-4" />,
        isCustom: false,
      });
    });
  }

  // Default to the current state when it's visible, otherwise the first visible tab. Indices are
  // original positions (see above), so a hidden current/first tab never offsets the selection.
  let defaultTabIndex = tabs.length > 0 ? tabs[0].index : 0;
  const currentState = currentStateId ? innovationFlowStates.find(state => state.id === currentStateId) : undefined;
  if (currentState) {
    defaultTabIndex = allStates.indexOf(currentState);
  }

  // Full section count (including hidden ones) so direct-URL access to a hidden section still
  // resolves. Falls back to the default-tab count when the flow has no states.
  const sectionCount = allStates.length > 0 ? allStates.length : tabs.length;

  return {
    tabs,
    defaultTabIndex,
    sectionCount,
    showSettings: permissions.canUpdate,
  };
}
