import React from 'react';
import SpaceDashboardPage from './Tabs/SpaceDashboard/SpaceDashboardPage';
import SpaceCommunityPage from './Tabs/SpaceCommunityPage/SpaceCommunityPage';
import SpaceSubspacesPage from './Tabs/SpaceSubspacesPage';
import SpaceKnowledgeBasePage from './Tabs/SpaceKnowledgeBase/SpaceKnowledgeBasePage';
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
  sectionNumber?: string; // Base 1 tab number
  dialog?: string;
};

const ensureParamType = <T extends string>(param: string | undefined, validValues: T[]): T | undefined => {
  if (param && validValues.includes(param as T)) {
    return param as T;
  }
  return undefined;
};

const TabbedLayoutPage = ({ sectionNumber, dialog: queryStringDialog }: TabbedLayoutPageProps) => {
  const { space } = useSpace();
  const { defaultTabIndex } = useSpaceTabs({ spaceId: space.id });
  const dialog = ensureParamType(queryStringDialog, TabbedLayoutDialogs);

  switch (sectionNumber) {
    case '1':
      return <SpaceDashboardPage dialog={dialog} />;
    case '2':
      return <SpaceCommunityPage />;
    case '3':
      return <SpaceSubspacesPage />;
    case '4':
      return <SpaceKnowledgeBasePage sectionIndex={3} />;
    case '5':
      // Still not fully implemented, but in the future spaces may have more tabs
      return <SpaceKnowledgeBasePage sectionIndex={4} />;
    default: {
      // Only redirect if defaultTab is already
      if (defaultTabIndex !== undefined && dialog === undefined) {
        return <Navigate to={`./?section=${defaultTabIndex + 1}`} replace />;
      }
      return undefined;
    }
  }
};

export default TabbedLayoutPage;
