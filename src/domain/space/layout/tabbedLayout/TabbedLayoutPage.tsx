import React from 'react';
import SpaceDashboardPage from './Tabs/SpaceDashboard/SpaceDashboardPage';
import SpaceCommunityPage from './Tabs/SpaceCommunityPage/SpaceCommunityPage';
import SpaceSubspacesPage from './Tabs/SpaceSubspacesPage';
import SpaceKnowledgeBasePage from './Tabs/SpaceKnowledgeBase/SpaceKnowledgeBasePage';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import useSpaceTabs from './layout/useSpaceTabs';
import { useSpace } from '../../context/useSpace';
import { Navigate } from 'react-router-dom';

export type TabbedLayoutDialogsType = 'about' | 'updates' | 'contributors' | 'calendar';
const TabbedLayoutDialogs = ['about', 'updates', 'contributors', 'calendar'] as TabbedLayoutDialogsType[];

export enum TabbedLayoutParams {
  Section = 'section',
  Dialog = 'dialog',
}
export type TabbedLayoutPageProps = {
  section?: string;
  dialog?: string;
};

const ensureParamType = <T extends string>(param: string | undefined, validValues: T[]): T | undefined => {
  if (param && validValues.includes(param as T)) {
    return param as T;
  }
  return undefined;
};

const TabbedLayoutPage = ({ section, dialog: queryStringDialog }: TabbedLayoutPageProps) => {
  const { space } = useSpace();
  const { defaultTab } = useSpaceTabs({ spaceId: space.id });
  const dialog = ensureParamType(queryStringDialog, TabbedLayoutDialogs);

  switch (section) {
    case '1':
      return <SpaceDashboardPage dialog={dialog} />;
    case '2':
      return <SpaceCommunityPage />;
    case '3':
      return <SpaceSubspacesPage />;
    case '4':
      return <SpaceKnowledgeBasePage calloutsFlowState={EntityPageSection.KnowledgeBase} />;
    case '5':
      return <SpaceKnowledgeBasePage calloutsFlowState={EntityPageSection.Custom} />;
    default:
      return defaultTab !== undefined ? <Navigate to={`./?section=${defaultTab + 1}`} replace /> : undefined;
  }
};

export default TabbedLayoutPage;
