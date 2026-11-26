import { BookOpen, Layers, LayoutDashboard, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSpace } from '@/domain/space/context/useSpace';
import { orderedStages, useSpacePageData } from '@/domain/space/hooks/useSpacePage';

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
  /**
   * Each state's stored `sidebar` (wire enum values), indexed by original position in
   * the full flow — same indexing as `CrdTabDefinition.index`. Empty while the query
   * is loading or when the space has no flow states, so `stateSidebars[i]` being
   * `undefined` means "unknown", never "configured empty".
   */
  stateSidebars: ReadonlyArray<readonly string[]>;
  /**
   * The space has stages but the server does not serve their visibility, sidebar and the current stage yet
   * (021 tasks.md S01): the strip, the default tab and the per-tab widgets are unavailable, never guessed.
   */
  unavailable: boolean;
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

  const space = useSpacePageData(skip ? undefined : spaceId, 'space')?.node;
  const allStates = orderedStages(space && 'stages' in space ? space.stages : undefined);
  const tabs: CrdTabDefinition[] = [];

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

  const unavailable = allStates.length > 0;
  const defaultTabIndex = unavailable ? -1 : 0;

  // Full section count (including hidden ones) so direct-URL access to a hidden section still
  // resolves. Falls back to the default-tab count when the flow has no states.
  const sectionCount = allStates.length > 0 ? allStates.length : tabs.length;

  return {
    tabs,
    defaultTabIndex,
    sectionCount,
    showSettings: permissions.canUpdate,
    stateSidebars: [],
    unavailable,
  };
}
