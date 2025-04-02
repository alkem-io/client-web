import React from 'react';
import SpaceDashboardPage from './Tabs/SpaceDashboard/SpaceDashboardPage';
import SpaceCommunityPage from './Tabs/SpaceCommunityPage/SpaceCommunityPage';
import SpaceSubspacesPage from './Tabs/SpaceSubspacesPage';
import SpaceKnowledgeBasePage from './Tabs/SpaceKnowledgeBase/SpaceKnowledgeBasePage';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';

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
  const dialog = ensureParamType(queryStringDialog, TabbedLayoutDialogs);

  switch (section) {
    case '2':
      return <SpaceCommunityPage />;
    case '3':
      return <SpaceSubspacesPage />;
    case '4':
      return <SpaceKnowledgeBasePage calloutsFlowState={EntityPageSection.KnowledgeBase} />;
    case '5':
      return <SpaceKnowledgeBasePage calloutsFlowState={EntityPageSection.Custom} />;
    case '1':
    default:
      return <SpaceDashboardPage dialog={dialog} />;
  }
};

export default TabbedLayoutPage;
