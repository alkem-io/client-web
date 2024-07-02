import AlkemioAvatar from '../../../../core/ui/image/AlkemioAvatar';
import { Box } from '@mui/material';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import LinkNoUnderline from '../../../shared/components/LinkNoUnderline';
import { styled } from '@mui/styles';
import LocationCaption from '../../../../core/ui/location/LocationCaption';
import { Text } from '../../../../core/ui/typography';

export interface LeadUserCardProps {
  contributor: {
    userUrl: string;
    avatarUrl: string | undefined;
    fullName: string;
    city?: string;
    country?: string;
    tags?: string[];
  };
}

const TagsWithSpacing = styled(TagsComponent)(({ theme }) => ({
  paddingTop: theme.spacing(1),
}));

const LeadUserCardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
}));

/**
 * @deprecated
 * use LeadContributorCard instead
 */
const LeadUserCard = ({ contributor }: LeadUserCardProps) => {
  const { userUrl, fullName, city, country, avatarUrl, tags } = contributor;

  return (
    <LeadUserCardContainer>
      <LinkNoUnderline to={userUrl}>
        <Box display="flex" gap={2}>
          <AlkemioAvatar src={avatarUrl} name={fullName} size="md2" />
          <Box>
            <Text>{fullName}</Text>
            <LocationCaption city={city} country={country} />
            {tags && <TagsWithSpacing tags={tags} />}
          </Box>
        </Box>
      </LinkNoUnderline>
    </LeadUserCardContainer>
  );
};

export default LeadUserCard;
