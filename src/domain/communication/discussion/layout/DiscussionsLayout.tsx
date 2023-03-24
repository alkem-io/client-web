import { Box, Button, Grid, Paper } from '@mui/material';
import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { RouterLink } from '../../../../common/components/core/RouterLink';
import { PageTitle } from '../../../../core/ui/typography';
import AddIcon from '@mui/icons-material/Add';
import Gutters from '../../../../core/ui/grid/Gutters';

interface DiscussionsLayoutProps {
  canCreateDiscussion?: boolean;
  categorySelector?: ReactNode;
  backButton?: ReactNode;
}

export const DiscussionsLayout: FC<DiscussionsLayoutProps> = ({
  canCreateDiscussion = false,
  categorySelector,
  backButton,
  children,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Grid item container alignItems="center">
        <PageTitle>{t('pages.forum.title')}</PageTitle>
        <Box sx={{ width: '100%', marginY: theme => theme.spacing(2) }}>{backButton}</Box>
        <Button
          variant="contained"
          component={RouterLink}
          startIcon={<AddIcon />}
          disabled={!canCreateDiscussion}
          to="new"
          sx={{ marginLeft: 'auto', marginY: theme => theme.spacing(1) }}
        >
          {t('components.discussion.initiate')}
        </Button>
      </Grid>
      <Grid item container spacing={2}>
        {categorySelector && (
          <Grid item>
            <Paper elevation={0}>{categorySelector}</Paper>
          </Grid>
        )}
        <Grid item xs>
          <Paper>
            <Gutters>{children}</Gutters>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default DiscussionsLayout;
