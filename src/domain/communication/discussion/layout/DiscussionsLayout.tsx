import AddIcon from '@mui/icons-material/Add';
import { Button, GridLegacy, Paper } from '@mui/material';
import type { PropsWithChildren, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Gutters from '@/core/ui/grid/Gutters';

type DiscussionsLayoutProps = {
  canCreateDiscussion?: boolean;
  categorySelector?: ReactNode;
  backButton?: ReactNode;
};

export const DiscussionsLayout = ({
  canCreateDiscussion = false,
  categorySelector,
  backButton,
  children,
}: PropsWithChildren<DiscussionsLayoutProps>) => {
  const { t } = useTranslation();

  return (
    <>
      {/* TODO: Remove use of MUI Grid - We don't use MUI Grid anymore*/}
      <GridLegacy item={true} container={true} alignItems="center">
        {backButton}
        {canCreateDiscussion && (
          <Button
            variant="contained"
            component={Link}
            startIcon={<AddIcon />}
            to="/forum/new"
            sx={{ marginLeft: 'auto' }}
          >
            {t('components.discussion.initiate')}
          </Button>
        )}
      </GridLegacy>
      <GridLegacy item={true} container={true} spacing={2}>
        {categorySelector && (
          <GridLegacy item={true}>
            <Paper elevation={0}>{categorySelector}</Paper>
          </GridLegacy>
        )}
        <GridLegacy item={true} xs={true}>
          <Paper>
            <Gutters>{children}</Gutters>
          </Paper>
        </GridLegacy>
      </GridLegacy>
    </>
  );
};

export default DiscussionsLayout;
