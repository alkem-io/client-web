import Avatar from '../../../../common/components/core/Avatar';
import { Box } from '@mui/material';
import LinkNoUnderline from '../../../shared/components/LinkNoUnderline';
import { styled } from '@mui/styles';
import LocationCaption from '../../../../core/ui/location/LocationCaption';
import { Caption, Text } from '../../../../core/ui/typography';
import webkitLineClamp from '../../../../core/ui/utils/webkitLineClamp';

export interface LeadOrganizationCardProps {
  organizationUrl: string;
  avatarUrl: string | undefined;
  displayName: string;
  city?: string;
  country?: string;
  tagline?: string;
}

const LeadOrganizationCardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
}));

const LeadOrganizationCard = ({
  organizationUrl,
  displayName,
  city,
  country,
  avatarUrl,
  tagline,
}: LeadOrganizationCardProps) => {
  return (
    <LeadOrganizationCardContainer>
      <LinkNoUnderline to={organizationUrl}>
        <Box display="flex" gap={2}>
          <Avatar src={avatarUrl} name={displayName} size="md2" />
          <Box>
            <Text>{displayName}</Text>
            <LocationCaption city={city} country={country} />
            <Caption sx={webkitLineClamp(2, { keepMinHeight: true })}>{tagline}</Caption>
          </Box>
        </Box>
      </LinkNoUnderline>
    </LeadOrganizationCardContainer>
  );
};

export default LeadOrganizationCard;
