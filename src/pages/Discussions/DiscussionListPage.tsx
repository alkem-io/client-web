import React, { FC } from 'react';
import DiscussionsLayout from '../../components/composite/layout/Discussions/DiscussionsLayout';
import { ThemeProviderV2 } from '../../context/ThemeProvider';
import { useUpdateNavigation } from '../../hooks';
import { DiscussionListView } from '../../views/Discussions/DiscussionsListView';
import { PageProps } from '../common';

interface DiscussionsPageProps extends PageProps {}

export const DiscussionListPage: FC<DiscussionsPageProps> = ({ paths }) => {
  useUpdateNavigation({ currentPaths: paths });

  return (
    <ThemeProviderV2>
      <DiscussionsLayout title="Discussions" allowCreation>
        <DiscussionListView />
      </DiscussionsLayout>
    </ThemeProviderV2>
  );
};
export default DiscussionListPage;
