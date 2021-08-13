import React, { FC } from 'react';
import Dialog from '@material-ui/core/Dialog';
import Avatar from '../core/Avatar';
import Typography from '../core/Typography';
import { User } from '../../models/graphql-schema';
import { Tagset } from '../../models/Profile';
import Tags from './Tags';
import { createStyles } from '../../hooks/useTheme';
import Divider from '../core/Divider';
import shuffleCollection from '../../utils/shuffleCollection';
import AvatarContainer from '../core/AvatarContainer';
import { AvatarsProvider } from '../../context/AvatarsProvider';
import { DialogContent, DialogTitle } from '../core/dialog';
import { Grid } from '@material-ui/core';

const groupPopUpStyles = createStyles(() => ({
  title: {
    textTransform: 'capitalize',
  },
}));

interface GroupPopUpProps {
  name: string;
  members?: Array<User>;
  profile?: {
    description?: string;
    avatar?: string;
    tagsets?: Tagset[];
    references?: Array<{ name: string; uri: string }>;
  };
  terms: Array<string>;
  onHide: () => void;
}

const GroupPopUp: FC<GroupPopUpProps> = ({ onHide, name, members, profile, terms }) => {
  const styles = groupPopUpStyles();
  const tags = profile?.tagsets?.find(ts => ts.name === 'default')?.tags?.map(t => t) || [];
  const tagList = [...terms, ...tags];

  return (
    <Dialog open={true} maxWidth="md" fullWidth aria-labelledby="group-dialog-title">
      <DialogTitle id="group-dialog-title" onClose={onHide}>
        Group Details
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item container alignItems={'center'}>
            <Grid item xs={2}>
              <Avatar src={profile?.avatar} size={'lg'} />
            </Grid>
            <Grid item xs={10}>
              <Typography variant={'h3'} className={styles.title}>
                {name || 'Name placeholder'}
              </Typography>
              <Tags tags={tagList} />
            </Grid>
          </Grid>
        </Grid>

        <Typography weight={'medium'} variant={'h4'}>
          {profile?.description || 'Description'}
        </Typography>

        <Divider noPadding />

        <AvatarsProvider users={members} count={10}>
          {populated => (
            <AvatarContainer title={'Active community members'}>
              {shuffleCollection(populated).map((u, i) => (
                <Avatar key={i} src={u.profile?.avatar} name={u.displayName} />
              ))}
              {members && members?.length - populated.length > 0 && (
                <Typography variant="h3" as="h3" color="positive">
                  {`... + ${members.length - populated.length} other members`}
                </Typography>
              )}
            </AvatarContainer>
          )}
        </AvatarsProvider>

        {profile?.references && profile?.references.length > 0 && (
          <>
            <Typography>References: </Typography>
            {profile?.references?.map((r, index) => (
              <Typography key={index}>
                <a href={r.uri} rel="noopener noreferrer" target="_blank">
                  {r.name}
                </a>
              </Typography>
            ))}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GroupPopUp;
