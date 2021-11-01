import React, { FC } from 'react';
import { ThemeProviderV2 } from '../../context/ThemeProvider';
import DiscussionView, { DiscussionViewProps } from '../../views/Discussions/DiscussionView';

interface DiscussionPageProps {}

const item: DiscussionViewProps = {
  title: 'Discussion subject title',
  subject:
    'Summary of 2 sentences to give more context to the matter when people want a TDLR. Its also good to show the essence of something.',
  description: `## Lorem ipsum dolor

sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.`,
  createdBy: 'Isabella Bookmaker',
  createdOn: '19/10/2021',
  avatars: ['A', 'B', 'C', 'D'],
  count: 43,
  comments: [
    {
      commentId: '1',
      message:
        'Discussion comment to be placed here. In approximately two to three sentences. Another one been added! Discussion comment to be placed here. In approximately two to three sentences. Another one been added! Discussion comment to be placed here. In approximately two to three sentences. Another one been added! Discussion comment to be placed here. In approximately two to three sentences. Another one been added! Discussion comment to be placed here. In approximately two to three sentences. Another one been added! Discussion comment to be placed here. In approximately two to three sentences. Another one been added! Discussion comment to be placed here. In approximately two to three sentences. Another one been added! Discussion comment to be placed here. In approximately two to three sentences. Another one been added!',
      createdBy: 'Isabella Bookmaker',
      createdOn: '19/10/2021 at 10.30 am',
      depth: 0,
    },
    {
      commentId: '2',
      message: 'Discussion comment to be placed here. In approximately two to three sentences. Another one been added!',
      createdBy: 'Isabella Bookmaker',
      createdOn: '19/10/2021 at 10.45 am',
      depth: 1,
    },
    {
      commentId: '3',
      message: 'Discussion comment to be placed here. In approximately two to three sentences. Another one been added!',
      createdBy: 'Isabella Bookmaker',
      createdOn: '19/10/2021 at 10.45 am',
      depth: 1,
    },
    {
      commentId: '4',
      message: 'Discussion comment to be placed here. In approximately two to three sentences. Another one been added!',
      createdBy: 'Isabella Bookmaker',
      createdOn: '19/10/2021 at 10.45 am',
      depth: 0,
    },
  ],
};

export const DiscussionPage: FC<DiscussionPageProps> = () => {
  return (
    <ThemeProviderV2>
      <DiscussionView {...item} />
    </ThemeProviderV2>
  );
};
export default DiscussionPage;
