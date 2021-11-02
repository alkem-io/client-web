import React, { FC, useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import DiscussionsLayout from '../../components/composite/layout/Discussions/DiscussionsLayout';
import { ThemeProviderV2 } from '../../context/ThemeProvider';
import { useUpdateNavigation, useUrlParams } from '../../hooks';
import DiscussionView, { DiscussionViewProps } from '../../views/Discussions/DiscussionView';
import { PageProps } from '../common';

interface DiscussionPageProps extends PageProps {}

const item: DiscussionViewProps = {
  title: 'Discussion subject title',
  description: `## Lorem ipsum dolor

sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.`,
  createdBy: 'Isabella Bookmaker',
  createdOn: new Date('2021-10-19 10:30'),
  avatars: ['A', 'B', 'C', 'D'],
  count: 43,
  comments: [
    {
      commentId: '1',
      message:
        'Discussion comment to be placed here. In approximately two to three sentences. Another one been added! Discussion comment to be placed here. In approximately two to three sentences. Another one been added! Discussion comment to be placed here. In approximately two to three sentences. Another one been added! Discussion comment to be placed here. In approximately two to three sentences. Another one been added! Discussion comment to be placed here. In approximately two to three sentences. Another one been added! Discussion comment to be placed here. In approximately two to three sentences. Another one been added! Discussion comment to be placed here. In approximately two to three sentences. Another one been added! Discussion comment to be placed here. In approximately two to three sentences. Another one been added!',
      createdBy: 'Isabella Bookmaker',
      createdOn: new Date('2021-10-19 10:30'),
      depth: 0,
    },
    {
      commentId: '2',
      message: 'Discussion comment to be placed here. In approximately two to three sentences. Another one been added!',
      createdBy: 'Isabella Bookmaker',
      createdOn: new Date('2021-10-19 10:45'),
      depth: 1,
    },
    {
      commentId: '3',
      message: 'Discussion comment to be placed here. In approximately two to three sentences. Another one been added!',
      createdBy: 'Isabella Bookmaker',
      createdOn: new Date('2021-10-19 10:45'),
      depth: 1,
    },
    {
      commentId: '4',
      message: 'Discussion comment to be placed here. In approximately two to three sentences. Another one been added!',
      createdBy: 'Isabella Bookmaker',
      createdOn: new Date('2021-10-19 10:45'),
      depth: 0,
    },
  ],
};

export const DiscussionPage: FC<DiscussionPageProps> = ({ paths }) => {
  const { url } = useRouteMatch();

  const { discussionId } = useUrlParams();
  const currentPaths = useMemo(() => [...paths, { value: url, name: discussionId, real: false }], [paths]);

  useUpdateNavigation({ currentPaths });

  // TODO [ATS]:  this will be constructed depending on the community.
  const title = 'Digital Twining - Discussion 1';

  return (
    <ThemeProviderV2>
      <DiscussionsLayout title={title}>
        <DiscussionView {...item} />
      </DiscussionsLayout>
    </ThemeProviderV2>
  );
};
export default DiscussionPage;
