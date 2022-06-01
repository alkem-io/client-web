import React, { FC } from 'react';
import { UserCardProps } from '../../components/composite/common/cards';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import { useTranslation } from 'react-i18next';
import { SectionSpacer } from '../../components/core/Section/Section';
import { Message, Searchable, User } from '../../models/graphql-schema';
import { Box } from '@mui/material';
import { CommunityUpdatesView } from '../CommunityUpdates/CommunityUpdatesView';

const UPDATES_CONTAINER_HEIGHT = 300;

export type SearchableUserCardProps = UserCardProps & Searchable;

export interface CommunityPageViewProps {
  messages?: Message[];
  messagesLoading: boolean;
  authors?: User[];
}

const CommunityPageView: FC<CommunityPageViewProps> = ({ messages = [], messagesLoading, authors = [], children }) => {
  const { t } = useTranslation();
  const updatesTitle = t('pages.community.updates.title', { count: messages.length });
  return (
    <>
      <SectionSpacer />
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
              entities={{ messages, members: authors }}
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
      {children}
    </>
  );
};

export default CommunityPageView;
