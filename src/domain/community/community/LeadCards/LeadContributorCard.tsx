import { Box } from '@mui/material';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import { styled } from '@mui/styles';
import LocationCaption from '../../../../core/ui/location/LocationCaption';
import { Text } from '../../../../core/ui/typography';
import { ContributorViewProps } from '../EntityDashboardContributorsSection/Types';
import Avatar from '../../../../core/ui/avatar/Avatar';
import RouterLink from '../../../../core/ui/link/RouterLink';

interface Props {
  contributor: ContributorViewProps;
}

const TagsWithSpacing = styled(TagsComponent)(({ theme }) => ({
  paddingTop: theme.spacing(1),
}));

const LeadContributorCardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
}));

const LeadContributorCard = ({ contributor }: Props) => {
  const {
    profile: {
      url: profileUrl,
      displayName,
      location: { city, country } = {},
      tagsets,
      avatar: { uri: avatarUrl } = {},
    },
  } = contributor;
  const tags = tagsets?.flatMap(({ tags }) => tags);

  return (
    <LeadContributorCardContainer>
      <Box display="flex" gap={2} component={RouterLink} to={profileUrl}>
        <Avatar src={avatarUrl} size="regular" />
        <Box>
          <Text>{displayName}</Text>
          <LocationCaption city={city} country={country} />
          {tags && <TagsWithSpacing tags={tags} />}
        </Box>
      </Box>
    </LeadContributorCardContainer>
  );
};

export default LeadContributorCard;
