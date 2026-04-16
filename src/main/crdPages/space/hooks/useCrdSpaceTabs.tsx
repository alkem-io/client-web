import { BookOpen, FileText, Layers, LayoutDashboard, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSpaceTabsQuery } from '@/core/apollo/generated/apollo-hooks';
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

  const innovationFlowStates = data?.lookup.space?.collaboration?.innovationFlow.states ?? [];
  const currentStateId = data?.lookup.space?.collaboration?.innovationFlow.currentState?.id;

  const tabs: CrdTabDefinition[] = innovationFlowStates.map((state, index) => {
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

  // If no flow states, provide defaults
  if (tabs.length === 0) {
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

  let defaultTabIndex = 0;
  if (currentStateId) {
    const stateIndex = innovationFlowStates.findIndex(s => s.id === currentStateId);
    if (stateIndex >= 0) {
      defaultTabIndex = stateIndex;
    }
  }

  return {
    tabs,
    defaultTabIndex,
    showSettings: permissions.canUpdate,
  };
}
