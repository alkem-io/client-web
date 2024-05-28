import AlkemioAvatar from '../../../../core/ui/image/AlkemioAvatar';
import { Box } from '@mui/material';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { styled } from '@mui/styles';
import LocationCaption from '../../../../core/ui/location/LocationCaption';
import { Caption, Text } from '../../../../core/ui/typography';
import webkitLineClamp from '../../../../core/ui/utils/webkitLineClamp';
import ContributorTooltip from '../../../../core/ui/card/ContributorTooltip';
import { FC } from 'react';
import useDirectMessageDialog from '../../../communication/messaging/DirectMessaging/useDirectMessageDialog';
import { useTranslation } from 'react-i18next';

export interface LeadOrganizationCardProps {
  id: string;
  organizationUrl: string;
  avatarSrc: string | undefined;
  displayName: string;
  city?: string;
  country?: string;
  tagline?: string;
  tags?: string[];
}

const LeadOrganizationCardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
}));

const LeadOrganizationCard: FC<LeadOrganizationCardProps> = props => {
  const { t } = useTranslation();
  const { id, organizationUrl, avatarSrc, displayName, city, country, tagline } = props;
  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  return (
    <>
      <ContributorTooltip
        {...props}
        onContact={() => {
          sendMessage('organization', {
            id: id,
            avatarUri: avatarSrc,
            displayName,
            city,
            country,
          });
        }}
      >
        <LeadOrganizationCardContainer>
          <RouterLink to={organizationUrl}>
            <Box display="flex" gap={2}>
              <AlkemioAvatar src={avatarSrc} name={displayName} size="md2" />
              <Box>
                <Text>{displayName}</Text>
                <LocationCaption city={city} country={country} />
                <Caption sx={webkitLineClamp(2, { keepMinHeight: true })}>{tagline}</Caption>
              </Box>
            </Box>
          </RouterLink>
        </LeadOrganizationCardContainer>
      </ContributorTooltip>
      {directMessageDialog}
    </>
  );
};

export default LeadOrganizationCard;
