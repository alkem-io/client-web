import { Avatar, Box, createStyles, Grid, Link, makeStyles, Typography } from '@material-ui/core';
import ForumIcon from '@material-ui/icons/Forum';
import { AvatarGroup } from '@material-ui/lab';
import React, { FC } from 'react';
import { RouterLink } from '../../../core/RouterLink';

export interface DiscussionOverviewProps {
  title: string;
  description: string;
  date: string;
  avatars: string[];
  count: number;
}

const useStyles = makeStyles(theme =>
  createStyles({
    avatar: {
      height: theme.spacing(3.5),
      width: theme.spacing(3.5),
    },
  })
);

const DiscussionOverview: FC<DiscussionOverviewProps> = ({ title, description, count, date, avatars }) => {
  const styles = useStyles();

  return (
    <Grid container spacing={2} alignItems="stretch" wrap="nowrap">
      <Grid item xs={8} md={9} lg={10} container direction="column">
        <Grid item>
          <Typography color="primary" variant="h3">
            <Link component={RouterLink} to="/discussions/1">
              {title}
            </Link>
          </Typography>
        </Grid>
        <Grid item>
          <Typography>{description}</Typography>
        </Grid>
        <Grid item>
          <Typography variant="body2">{date}</Typography>
        </Grid>
      </Grid>
      <Grid
        item
        xs={4}
        md={3}
        lg={2}
        container
        alignItems="center"
        spacing={2}
        justifyContent="flex-start"
        wrap="nowrap"
      >
        <Grid item xs={6}>
          <Grid item container>
            <AvatarGroup
              max={3}
              classes={{
                avatar: styles.avatar,
              }}
            >
              {avatars.map((a, i) => (
                <Avatar key={i} src="">
                  {a}
                </Avatar>
              ))}
            </AvatarGroup>
          </Grid>
        </Grid>
        <Grid item container xs={6} spacing={2} wrap="nowrap">
          <Grid item>
            <ForumIcon />
          </Grid>
          <Grid item>
            <Box fontWeight={'700'}>{`(${count})`}</Box>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
export default DiscussionOverview;
