import { Button, Grid, Paper } from '@mui/material';
import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { RouterLink } from '@/core/ui/link/deprecated/RouterLink';
import AddIcon from '@mui/icons-material/Add';
import Gutters from '@/core/ui/grid/Gutters';

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
      {/* TODO: Remove use of MUI Grid - We don't use MUI Grid anymore*/}
      <Grid item container alignItems="center">
        {backButton}
        {canCreateDiscussion && (
          <Button
            variant="contained"
            component={RouterLink}
            startIcon={<AddIcon />}
            to="/forum/new"
            sx={{ marginLeft: 'auto' }}
          >
            {t('components.discussion.initiate')}
          </Button>
        )}
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
