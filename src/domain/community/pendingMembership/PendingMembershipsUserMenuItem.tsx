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
import usePendingMemberships from './usePendingMemberships';

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
            {t('community.pendingMembership.dialogSubtitle')}
          </BlockSectionTitle>
          <BadgeCardView
            component={RouterLink}
            to={''}
            visual={
              <JourneyAvatar
                journeyTypeName="space"
                visualUri={undefined}
              />
            }
          >
            <BlockSectionTitle noWrap>21 days ago Denise Larsson invited you to        Working Challenge Centric</BlockSectionTitle>
            <CardText
              sx={{
                img: {
                  maxHeight: gutters(1),
                },
              }}
              noWrap
            >
              <WrapperMarkdown card flat>
                Hi Simone, I would like to invite you to join this Challenge, I have some amazing reasons for that which i will share with you but that won’t fit on one line and therefore this text needs to be truncated after I don’t know how many characters Hi Simone, I would like to invite you to join this Challenge, I have some amazing reasons for that which i will share with you but that won’t fit on one line and therefore this text needs to be truncated after I don’t know how many characters
              </WrapperMarkdown>
            </CardText>
          </BadgeCardView>
        </Gutters>
      </DialogWithGrid>
    </>
  );
};

export default PendingMembershipsUserMenuItem;