import { useSpaceTabsQuery } from '@/core/apollo/generated/apollo-hooks';
import { ReactNode, useMemo } from 'react';
import { useSpace } from '../../../context/useSpace';
import { TFunction, useTranslation } from 'react-i18next';
import { DashboardOutlined, SchoolOutlined, Tab } from '@mui/icons-material';
import TranslationKey from '@/core/i18n/utils/TranslationKey';
import { CalloutIcon } from '@/domain/collaboration/callout/icon/CalloutIcon';
import { SubspaceIcon } from '../../../icons/SubspaceIcon';

type TabDefinition = {
  label: string;
  description: string;
  icon: ReactNode;
};

const tabsDefaultNames: Record<string, TranslationKey> = {
  dashboard: 'pages.space.sections.tabs.dashboard',
  community: 'pages.space.sections.tabs.community',
  subspaces: 'pages.space.sections.tabs.subspaces',
  'knowledge base': 'pages.space.sections.tabs.knowledgeBase',
  contribute: 'pages.space.sections.tabs.contribute',
};

const tabName = (
  t: TFunction<'translation', undefined>,
  customName: string | undefined,
  defaultName: TranslationKey
): string => {
  if (!customName) {
    return String(t(defaultName));
  }

  if (tabsDefaultNames[customName.toLowerCase()]) {
    return String(t(tabsDefaultNames[customName.toLowerCase()]));
  }
  return customName;
};

type useSpaceTabsProvided = {
  tabs: TabDefinition[];
  defaultTab: number | undefined; // 0 based index of the tab. That is the currentState of the flow
  showSettings: boolean;
};

const useSpaceTabs = ({ spaceId }: { spaceId: string | undefined }): useSpaceTabsProvided => {
  const { t, i18n } = useTranslation();

  const { permissions } = useSpace();

  const { data: spaceTabsData, loading: spaceTabsLoading } = useSpaceTabsQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId,
  });

  const { tabs, defaultTab } = useMemo(() => {
    const result: TabDefinition[] = [];
    const innovationFlowTabs =
      spaceTabsData?.lookup.space?.collaboration?.innovationFlow.states.map(state => ({
        displayName: state.displayName,
        description: state.description,
      })) ?? [];
    const currentStateName = spaceTabsData?.lookup.space?.collaboration?.innovationFlow.currentState.displayName;
    const defaultTabIndex = currentStateName
      ? innovationFlowTabs.findIndex(state => state.displayName === currentStateName)
      : -1;

    result.push({
      label: tabName(t, innovationFlowTabs?.[0]?.displayName, 'pages.space.sections.tabs.dashboard'),
      icon: <DashboardOutlined />,
      description: innovationFlowTabs?.[0]?.description ?? '',
    });

    result.push({
      label: tabName(t, innovationFlowTabs?.[1]?.displayName, 'pages.space.sections.tabs.community'),
      icon: <CalloutIcon />,
      description: innovationFlowTabs?.[1]?.description ?? '',
    });

    result.push({
      label: tabName(t, innovationFlowTabs?.[2]?.displayName, 'pages.space.sections.tabs.subspaces'),
      icon: <SubspaceIcon />,
      description: innovationFlowTabs?.[2]?.description ?? '',
    });

    result.push({
      label: tabName(t, innovationFlowTabs?.[3]?.displayName, 'pages.space.sections.tabs.knowledgeBase'),
      icon: <SchoolOutlined />,
      description: innovationFlowTabs?.[3]?.description ?? '',
    });

    if (innovationFlowTabs.length > 4) {
      innovationFlowTabs.slice(4).forEach(state => {
        result.push({
          label: state.displayName,
          icon: <Tab />,
          description: state.description,
        });
      });
    }
    return {
      tabs: result,
      defaultTab: defaultTabIndex !== -1 ? defaultTabIndex : 0, // Default to the first tab if the current state is not found or incorrect
    };
  }, [t, i18n.language, spaceId, spaceTabsData, spaceTabsLoading]);

  return {
    tabs,
    defaultTab,
    showSettings: permissions.canUpdate,
  };
};

export default useSpaceTabs;
