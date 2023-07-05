import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import DialogWithGrid from '../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../core/ui/dialog/DialogHeader';
import { HdrStrongOutlined } from '@mui/icons-material';
import Gutters from '../../../core/ui/grid/Gutters';
import { BlockSectionTitle, CardText } from '../../../core/ui/typography';
import { gutters } from '../../../core/ui/grid/utils';
import BadgeCardView from '../../../core/ui/list/BadgeCardView';
import RouterLink from '../../../core/ui/link/RouterLink';
import WrapperMarkdown from '../../../core/ui/markdown/WrapperMarkdown';
import JourneyAvatar from '../../challenge/common/JourneyAvatar/JourneyAvatar';
import usePendingMemberships, { ApplicationHydrator, InvitationHydrator } from './usePendingMemberships';
import InvitationCardHorizontal from '../invitations/InvitationCardHorizontal/InvitationCardHorizontal';
import JourneyCard from '../../challenge/common/JourneyCard/JourneyCard';
import journeyIcon from '../../shared/components/JourneyIcon/JourneyIcon';

interface PendingMembershipsUserMenuItemProps {
  onClick?: (e: React.MouseEvent) => void;
}

const PendingMembershipsUserMenuItem = ({ onClick }: PendingMembershipsUserMenuItemProps) => {
  const { t } = useTranslation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { invitations, applications } = usePendingMemberships();

  return (
    <>
      <ListItemButton
        onClick={(event) => {
          setIsDialogOpen(true);
          onClick?.(event);
        }}
      >
        <ListItemIcon>
          <HdrStrongOutlined />
        </ListItemIcon>
        <ListItemText primary={t('community.pendingMembership.pendingMembershipsWithCount')} />
      </ListItemButton>
      <DialogWithGrid columns={12} open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogHeader
          title={(
            <Gutters row disablePadding>
              <HdrStrongOutlined fontSize="small" />
              {t('community.pendingMembership.pendingMemberships')}
            </Gutters>
          )}
          onClose={() => setIsDialogOpen(false)}
        />
        <Gutters paddingTop={0}>
          <BlockSectionTitle>
            {t('community.pendingMembership.invitationsSectionTitle')}
          </BlockSectionTitle>
          {invitations?.map(invitation => (
            <InvitationHydrator invitation={invitation}>
              {({ invitation }) => <InvitationCardHorizontal invitation={invitation} />}
            </InvitationHydrator>
          ))}
          <BlockSectionTitle>
            {t('community.pendingMembership.applicationsSectionTitle')}
          </BlockSectionTitle>
          {applications?.map(application => (
            <ApplicationHydrator application={application}>
              {({ application }) => application && (
                <JourneyCard
                  iconComponent={journeyIcon[application.journeyTypeName]}
                  header={application.journeyDisplayName}
                  tagline={application.journeyDescription ?? ''}
                  tags={application.journeyTags ?? []}
                  journeyUri={''}
                />
              )}
            </ApplicationHydrator>
          ))}
        </Gutters>
      </DialogWithGrid>
    </>
  );
};

export default PendingMembershipsUserMenuItem;