import { Box, Grid, Paper, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import WrapperButton from '../../../core/WrapperButton';
import { RouterLink } from '../../../core/RouterLink';

interface DiscussionsLayoutProps {
  title: string;
  icon?: React.ReactElement;
  newUrl?: string;
  canCreateDiscussion?: boolean;
  categorySelector?: ReactNode;
  enablePaper?: boolean;
}
const useStyles = makeStyles(theme =>
  createStyles({
    paper: {
      background: theme.palette.neutralLight.main,
      width: '100%',
    },
    icon: {
      color: theme.palette.primary.main,
      paddingRight: theme.spacing(1),

      '&>*': {
        fontSize: theme.typography.h1.fontSize,
      },
    },
    children: {
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(3),
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
    },
    title: {
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(3),
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
    },
    titleDense: {
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(3),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
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
  icon,
  enablePaper = true,
}) => {
  const { t } = useTranslation();
  const styles = useStyles();

  const titleClasses = {
    [styles.paper]: true,
    [styles.title]: enablePaper,
    [styles.titleDense]: !enablePaper,
  } as const;

  return (
    <Grid container spacing={2}>
      <Grid item container>
        <Paper square className={clsx(titleClasses)}>
          <Box display="flex" alignItems={'center'}>
            <Box alignItems={'center'} display="flex">
              {icon && <span className={styles.icon}>{icon}</span>}
              <Typography variant="h3">{title}</Typography>
            </Box>
            <Box flexGrow={1} />
            <Box justifyContent={'flex-end'} flexShrink={0}>
              {newUrl && (
                <WrapperButton
                  as={RouterLink}
                  text={t('components.discussions-layout.buttons.new-discussion')}
                  variant="primary"
                  to={newUrl}
                  disabled={!canCreateDiscussion}
                />
              )}
            </Box>
          </Box>
        </Paper>
      </Grid>
      <Grid item container spacing={2}>
        {categorySelector && (
          <Grid item>
            <Paper elevation={0} square className={clsx(styles.paper, styles.categorySelector)}>
              {categorySelector}
            </Paper>
          </Grid>
        )}
        <Grid item xs>
          {children}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default DiscussionsLayout;
