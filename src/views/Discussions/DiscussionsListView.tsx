import { CardContent, createStyles, Grid, makeStyles, Paper, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { Filter } from '../../components/Admin/Common/Filter';
import ProfileCard from '../../components/composite/common/cards/ProfileCard/ProfileCard';
import DiscussionOverview from '../../components/composite/entities/Communication/DiscussionOverview';
import Button from '../../components/core/Button';

const useStyles = makeStyles(theme =>
  createStyles({
    paper: {
      background: theme.palette.neutralLight.main,
      width: '100%',
    },
  })
);

export const DiscussionOverviewView: FC = () => {
  const styles = useStyles();
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
    <Grid container spacing={2}>
      <Grid item container>
        <Paper elevation={0} square className={styles.paper}>
          <CardContent>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item>
                <Typography variant="h1">Digital Twining - Discussions</Typography>
              </Grid>
              <Grid item>
                <Button text={'Initiate discussions'} size="small" />
              </Grid>
            </Grid>
          </CardContent>
        </Paper>
      </Grid>

      <Grid item container>
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
      </Grid>
    </Grid>
  );
};
