import Avatar from '../../../components/core/Avatar';
import { Box, Typography } from '@mui/material';
import TagsComponent from '../../../domain/shared/components/TagsComponent/TagsComponent';
import LinkNoUnderline from '../../shared/components/LinkNoUnderline';
import { styled } from '@mui/styles';

export interface LeadUserCardProps {
  userUrl: string;
  avatarUrl: string | undefined;
  fullName: string;
  city?: string;
  country?: string;
  tags?: string[];
}

const TagsWithSpacing = styled(TagsComponent)(({ theme }) => ({
  paddingTop: theme.spacing(1),
}));

const LeadUserCardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
}));

const LeadUserCard = ({ userUrl, fullName, city, country, avatarUrl, tags }: LeadUserCardProps) => {
  return (
    <LeadUserCardContainer>
      <LinkNoUnderline to={userUrl}>
        <Box display="flex" gap={2}>
          <Avatar src={avatarUrl} name={fullName} size="md2" />
          <Box>
            <Typography variant="body1">{fullName}</Typography>
            {city || country ? <Typography variant="body2">{[city, country].join(', ')}</Typography> : null}
            {tags && <TagsWithSpacing tags={tags} />}
          </Box>
        </Box>
      </LinkNoUnderline>
    </LeadUserCardContainer>
  );
};

export default LeadUserCard;
