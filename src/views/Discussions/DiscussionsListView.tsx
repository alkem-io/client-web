import { Grid } from '@material-ui/core';
import React, { FC } from 'react';
import { Filter } from '../../components/Admin/Common/Filter';
import ProfileCard from '../../components/composite/common/cards/ProfileCard/ProfileCard';
import DiscussionOverview from '../../components/composite/entities/Communication/DiscussionOverview';
import DiscussionsLayout from '../../components/composite/layout/Discussions/DiscussionsLayout';

export const DiscussionOverviewView: FC = () => {
  const data = [
    {
      title: 'Discussion subject title',
      description:
        'Discussion information to be placed here. In approximately two to three sentences, this is an even long sentence. Another one been added!',
      date: '19/10/2021',
      avatars: ['A', 'B', 'C', 'D'],
      count: 43,
    },
    {
      title: 'Discussion subject title',
      description:
        'Discussion information to be placed here. In approximately two to three sentences, this is an even long sentence. Another one been added!',
      date: '19/10/2021',
      avatars: ['A', 'D'],
      count: 3,
    },
    {
      title: 'Discussion subject title',
      description:
        'Discussion information to be placed here. In approximately two to three sentences, this is an even long sentence. Another one been added!',
      date: '19/10/2021',
      avatars: ['A', 'B', 'C', 'D'],
      count: 43,
    },
    {
      title: 'Discussion subject title',
      description:
        'Discussion information to be placed here. In approximately two to three sentences, this is an even long sentence. Another one been added!',
      date: '19/10/2021',
      avatars: ['A', 'B', 'C', 'D'],
      count: 43,
    },
  ];
  return (
    <DiscussionsLayout title="Discussions" allowCreation>
      <ProfileCard title="Discussions" helpText="List of all discussions">
        <Grid container spacing={2}>
          <Filter data={data} sort>
            {filteredData =>
              filteredData.map((item, index) => (
                <Grid item key={index} xs={12}>
                  <DiscussionOverview {...item} />
                </Grid>
              ))
            }
          </Filter>
        </Grid>
      </ProfileCard>
    </DiscussionsLayout>
  );
};
