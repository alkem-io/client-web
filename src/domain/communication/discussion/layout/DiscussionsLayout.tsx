import { Button, GridLegacy, Paper } from '@mui/material';
import { PropsWithChildren, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import Gutters from '@/core/ui/grid/Gutters';
import { Link } from 'react-router-dom';

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
      <GridLegacy item container alignItems="center">
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
      <GridLegacy item container spacing={2}>
        {categorySelector && (
          <GridLegacy item>
            <Paper elevation={0}>{categorySelector}</Paper>
          </GridLegacy>
        )}
        <GridLegacy item xs>
          <Paper>
            <Gutters>{children}</Gutters>
          </Paper>
        </GridLegacy>
      </GridLegacy>
    </>
  );
};

export default DiscussionsLayout;
