import React, { FC } from 'react';
import DiscussionsLayout from '../../components/composite/layout/Discussions/DiscussionsLayout';
import { ThemeProviderV2 } from '../../context/ThemeProvider';
import NewDiscussionView from '../../views/Discussions/NewDiscussionView';

export interface NewDiscussionPageProps {}

const NewDiscussionPage: FC<NewDiscussionPageProps> = () => {
  return (
    <ThemeProviderV2>
      <DiscussionsLayout title="Digital Twinning - Initiate Discussion">
        <NewDiscussionView />
      </DiscussionsLayout>
    </ThemeProviderV2>
  );
};
export default NewDiscussionPage;
