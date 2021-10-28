import React, { FC } from 'react';
import { ThemeProviderV2 } from '../context/ThemeProvider';
import { DiscussionOverviewView } from '../views/Discussions/DiscussionsListView';

interface DiscussionsPageProps {}

export const DiscussionsPage: FC<DiscussionsPageProps> = () => {
  return (
    <ThemeProviderV2>
      <DiscussionOverviewView />
    </ThemeProviderV2>
  );
};
export default DiscussionsPage;
