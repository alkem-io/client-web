import React, { FC, useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import DiscussionsLayout from '../../components/composite/layout/Discussions/DiscussionsLayout';
import { ThemeProviderV2 } from '../../context/ThemeProvider';
import { useUpdateNavigation } from '../../hooks';
import NewDiscussionView from '../../views/Discussions/NewDiscussionView';
import { PageProps } from '../common';

export interface NewDiscussionPageProps extends PageProps {}

const NewDiscussionPage: FC<NewDiscussionPageProps> = ({ paths }) => {
  const { url } = useRouteMatch();

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'new', real: false }], [paths]);

  useUpdateNavigation({ currentPaths });

  return (
    <ThemeProviderV2>
      <DiscussionsLayout title="Digital Twinning - Initiate Discussion">
        <NewDiscussionView />
      </DiscussionsLayout>
    </ThemeProviderV2>
  );
};
export default NewDiscussionPage;
