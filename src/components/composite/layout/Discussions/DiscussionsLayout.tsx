import { createStyles, Grid, makeStyles, Paper, Typography } from '@material-ui/core';
import clsx from 'clsx';
import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../core/Button';
import { RouterLink } from '../../../core/RouterLink';

interface DiscussionsLayoutProps {
  title: string;
  newUrl?: string;
  canCreateDiscussion?: boolean;
  categorySelector?: ReactNode;
}

const useStyles = makeStyles(theme =>
  createStyles({
    paper: {
      background: theme.palette.neutralLight.main,
      width: '100%',
    },
    title: {
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(3),
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
    },
    children: {
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(3),
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
    },
    categorySelector: {},
  })
);

export const DiscussionsLayout: FC<DiscussionsLayoutProps> = ({
  title,
  newUrl,
  canCreateDiscussion = false,
  categorySelector,
  children,
}) => {
  const { t } = useTranslation();
  const styles = useStyles();

  return (
    <Grid container spacing={2}>
      <Grid item container>
        <Paper elevation={0} square className={clsx(styles.paper, styles.title)}>
          <Grid container alignItems="center" justifyContent="space-between" wrap="nowrap">
            <Grid item>
              <Typography variant="h1">{title}</Typography>
            </Grid>
            {newUrl && (
              <Grid item justifyContent={'flex-end'} wrap="nowrap">
                <Button
                  as={RouterLink}
                  text={t('components.discussions-layout.buttons.new-discussion')}
                  variant="primary"
                  to={newUrl}
                  disabled={!canCreateDiscussion}
                />
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>
      <Grid item container spacing={2}>
        {categorySelector && (
          <Grid item xs={2}>
            <Paper elevation={0} square className={clsx(styles.paper, styles.categorySelector)}>
              {categorySelector}
            </Paper>
          </Grid>
        )}
        <Grid item xs={categorySelector ? 10 : 12}>
          <Paper elevation={0} square className={clsx(styles.paper, styles.children)}>
            {children}
          </Paper>
        </Grid>
      </Grid>
    </Grid>
  );
};
export default DiscussionsLayout;
