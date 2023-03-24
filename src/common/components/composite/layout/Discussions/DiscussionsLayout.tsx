import { Button, Grid, Paper } from '@mui/material';
import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { RouterLink } from '../../../core/RouterLink';
import { PageTitle } from '../../../../../core/ui/typography';
import AddIcon from '@mui/icons-material/Add';

interface DiscussionsLayoutProps {
  canCreateDiscussion?: boolean;
  categorySelector?: ReactNode;
}

export const DiscussionsLayout: FC<DiscussionsLayoutProps> = ({
  canCreateDiscussion = false,
  categorySelector,
  children,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Grid item container justifyContent="space-between" alignItems="center">
        <PageTitle>{t('pages.forum.title')}</PageTitle>
        {canCreateDiscussion && (
          <Button variant="contained" component={RouterLink} startIcon={<AddIcon />} to="new">
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
          {children}
        </Grid>
      </Grid>
    </>
  );
};

export default DiscussionsLayout;
