import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import { makeStyles } from '@mui/styles';
import Avatar from '../../core/Avatar';
import Button from '../../core/Button';
import Typography from '../../core/Typography';
import { DialogActions, DialogContent, DialogTitle } from '../../core/dialog';
import { Grid } from '@mui/material';
import TagContainer from '../../core/TagContainer';
import Tag from '../../core/Tag';

const getStyles = makeStyles(theme => ({
  title: {
    textTransform: 'capitalize',
  },
  table: {
    '& > thead > tr > th': {
      background: theme.palette.primary.main,
      color: theme.palette.background.paper,
      textAlign: 'center',
    },
    '& td': {
      padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
    },
  },
  divCentered: {
    display: 'flex',
    justifyContent: 'center',
    flexGrow: 1,
  },
  flex: {
    display: 'flex',
  },
}));

export interface PopUpViewmodel {
  avatar: string;
  tags: string[];
  tagline: string;
  displayName: string;
  hubName: string;
  challengeName: string;
  url: string;
}

interface Props {
  onHide: () => void;
  model: PopUpViewmodel;
}

const PopUp: FC<Props> = ({
  onHide,
  model: { avatar, tags = [], tagline, displayName, hubName, challengeName, url },
}) => {
  const { t } = useTranslation();
  const styles = getStyles();

  return (
    <Dialog open={true} maxWidth="md" fullWidth aria-labelledby="challenge-dialog-title">
      <DialogTitle id="challenge-dialog-title" onClose={onHide}>
        <Grid container spacing={2}>
          <Grid item container alignItems={'center'}>
            <Grid item xs={2}>
              <Avatar src={avatar} size={'lg'} />
            </Grid>
            <Grid item container justifyContent={'center'} xs={10}>
              <Typography variant={'h3'} className={styles.title}>
                {displayName}
              </Typography>
            </Grid>
          </Grid>
          <Grid item>
            <Typography>{tagline}</Typography>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} direction="column">
          <Grid container item className={styles.flex} justifyContent="center">
            {tags.length > 0 ? (
              <TagContainer>
                {tags.map((t, i) => (
                  <Tag key={i} text={t} color="neutralMedium" />
                ))}
              </TagContainer>
            ) : (
              <span>No tags available</span>
            )}
          </Grid>
          {hubName && (
            <Grid item>
              <Typography weight={'medium'} variant={'h4'}>
                {t('common.hub')}: {hubName}
              </Typography>
            </Grid>
          )}
          {challengeName && (
            <Grid item>
              <Typography weight={'medium'} variant={'h4'}>
                {t('common.challenge')}: {challengeName}
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      {url && (
        <DialogActions>
          <Button variant="primary" text={t('buttons.explore')} as={Link} to={url} />
        </DialogActions>
      )}
    </Dialog>
  );
};

export default PopUp;
