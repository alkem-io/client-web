import { createStyles, Grid, makeStyles, Paper, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../core/Button';
import { RouterLink } from '../../../core/RouterLink';

interface DiscussionsLayoutProps {
  title: string;
  icon?: React.ReactElement;
  newUrl?: string;
}

const useStyles = makeStyles(theme =>
  createStyles({
    paper: {
      background: theme.palette.neutralLight.main,
      width: '100%',
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(3),
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
    },
    icon: {
      color: theme.palette.primary.main,
      paddingRight: theme.spacing(1),

      '&>*': {
        fontSize: theme.typography.h1.fontSize,
      },
    },
  })
);

export const DiscussionsLayout: FC<DiscussionsLayoutProps> = ({ title, icon, newUrl, children }) => {
  const { t } = useTranslation();
  const styles = useStyles();

  return (
    <Grid container spacing={2}>
      <Grid item container>
        <Paper elevation={0} square className={styles.paper}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid container item alignItems={'center'}>
              <span className={styles.icon}>{icon}</span>
              <Typography variant="h1">{title}</Typography>
            </Grid>
            {newUrl && (
              <Grid item>
                <Button
                  as={RouterLink}
                  text={t('components.discussions-layout.buttons.new-discussion')}
                  variant="primary"
                  to={newUrl}
                />
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>
      <Grid item container>
        <Paper elevation={0} square className={styles.paper}>
          {children}
        </Paper>
      </Grid>
    </Grid>
  );
};
export default DiscussionsLayout;
