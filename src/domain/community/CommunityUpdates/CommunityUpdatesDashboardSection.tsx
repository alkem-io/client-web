import React from 'react';
import { UserCardProps } from '../../../common/components/composite/common/cards';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import DashboardGenericSection from '../../shared/components/DashboardSections/DashboardGenericSection';
import { useTranslation } from 'react-i18next';
import { Message, Searchable } from '../../../models/graphql-schema';
import { Box } from '@mui/material';
import { CommunityUpdatesView } from '../../../views/CommunityUpdates/CommunityUpdatesView';
import { Author } from '../../../models/discussion/author';

const UPDATES_CONTAINER_HEIGHT = 300;

export type SearchableUserCardProps = UserCardProps & Searchable;

export interface CommunityUpdatesDashboardSectionProps {
  messages?: Message[];
  messagesLoading: boolean;
  authors?: Author[];
}

const CommunityUpdatesDashboardSection = ({
  messages = [],
  messagesLoading,
  authors = [],
}: CommunityUpdatesDashboardSectionProps) => {
  const { t } = useTranslation();
  const updatesTitle = t('pages.community.updates.title', { count: messages.length });
  return (
    <DashboardGenericSection>
      <Box component={Typography} variant="h3" paddingBottom={0.5}>
        {messagesLoading ? <Skeleton width="20%" /> : updatesTitle}
      </Box>
      {!messages.length && !messagesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Typography>{t('pages.community.updates.no-data')}</Typography>
        </Box>
      ) : (
        <Box sx={{ height: `${UPDATES_CONTAINER_HEIGHT}px`, overflowY: 'auto' }}>
          <CommunityUpdatesView
            entities={{ messages, authors }}
            state={{
              loadingMessages: messagesLoading,
              submittingMessage: false,
              removingMessage: false,
            }}
            options={{
              hideHeaders: true,
              disableCollapse: true,
              disableElevation: true,
              itemsPerRow: 1,
            }}
          />
        </Box>
      )}
    </DashboardGenericSection>
  );
};

export default CommunityUpdatesDashboardSection;
