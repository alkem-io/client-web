import { createStyles, Grid, makeStyles, Paper, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../core/Button';
import { RouterLink } from '../../../core/RouterLink';

interface DiscussionsLayoutProps {
  title: string;
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
  })
);

export const DiscussionsLayout: FC<DiscussionsLayoutProps> = ({ title, newUrl, children }) => {
  const { t } = useTranslation();
  const styles = useStyles();

  return (
    <Grid container spacing={2}>
      <Grid item container>
        <Paper elevation={0} square className={styles.paper}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
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
