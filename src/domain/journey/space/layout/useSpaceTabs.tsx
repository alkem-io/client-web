import { useSpaceTabsQuery } from '@/core/apollo/generated/apollo-hooks';
import { ReactNode, useMemo } from 'react';
import { useSpace } from '../../../space/SpaceContext/useSpace';
import { TFunction, useTranslation } from 'react-i18next';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { DashboardOutlined, SchoolOutlined, Tab } from '@mui/icons-material';
import TranslationKey from '@/core/i18n/utils/TranslationKey';
import { CalloutIcon } from '@/domain/collaboration/callout/icon/CalloutIcon';
import { SubspaceIcon } from '../../subspace/icon/SubspaceIcon';

type TabDefinition = {
  value: EntityPageSection | string;
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

const useSpaceTabs = () => {
  const { t, i18n } = useTranslation();

  const { space, permissions } = useSpace();
  const collaborationId = space?.collaborationId;

  const { data: spaceTabsData, loading: spaceTabsLoading } = useSpaceTabsQuery({
    variables: {
      collaborationId: collaborationId!,
    },
    skip: !collaborationId,
  });

  const tabs = useMemo(() => {
    const result: TabDefinition[] = [];
    const innovationFlowTabs =
      spaceTabsData?.lookup.collaboration?.innovationFlow.states.map(state => ({
        displayName: state.displayName,
        description: state.description,
      })) ?? [];

    result.push({
      value: EntityPageSection.Dashboard,
      label: tabName(t, innovationFlowTabs?.[0]?.displayName, 'pages.space.sections.tabs.dashboard'),
      icon: <DashboardOutlined />,
      description: innovationFlowTabs?.[0]?.description ?? '',
    });

    result.push({
      value: EntityPageSection.Community,
      label: tabName(t, innovationFlowTabs?.[1]?.displayName, 'pages.space.sections.tabs.community'),
      icon: <CalloutIcon />,
      description: innovationFlowTabs?.[1]?.description ?? '',
    });

    result.push({
      value: EntityPageSection.Subspaces,
      label: tabName(t, innovationFlowTabs?.[2]?.displayName, 'pages.space.sections.tabs.subspaces'),
      icon: <SubspaceIcon />,
      description: innovationFlowTabs?.[2]?.description ?? '',
    });

    result.push({
      value: EntityPageSection.KnowledgeBase,
      label: tabName(t, innovationFlowTabs?.[3]?.displayName, 'pages.space.sections.tabs.knowledgeBase'),
      icon: <SchoolOutlined />,
      description: innovationFlowTabs?.[3]?.description ?? '',
    });

    if (innovationFlowTabs.length > 4) {
      innovationFlowTabs.slice(4).forEach(state => {
        result.push({
          value: state.displayName,
          label: state.displayName,
          icon: <Tab />,
          description: state.description,
        });
      });
    }
    return result;
  }, [t, i18n.language, spaceTabsData, spaceTabsLoading]);

  return {
    tabs,
    showSettings: permissions.canUpdate,
  };
};

export default useSpaceTabs;
