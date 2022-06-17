import Avatar from '../../../components/core/Avatar';
import { Box, Typography } from '@mui/material';
import TagsComponent from '../../../components/composite/common/TagsComponent/TagsComponent';
import { Link } from 'react-router-dom';
import { styled } from '@mui/styles';

export interface LeadUserCardProps {
  userUrl: string;
  avatarUrl: string | undefined;
  fullName: string;
  city?: string;
  country?: string;
  tags?: string[];
}

const LinkNoUnderline = styled(Link)({
  textDecoration: 'none',
  color: 'inherit',
});

const TagsWithSpacing = styled(TagsComponent)(({ theme }) => ({
  paddingTop: theme.spacing(1),
}));

const LeadUserCard = ({ userUrl, fullName, city, country, avatarUrl, tags }: LeadUserCardProps) => {
  return (
    <LinkNoUnderline to={userUrl}>
      <Box display="flex" gap={2}>
        <Avatar src={avatarUrl} name={fullName} size="lg" />
        <Box>
          <Typography variant="body1">{fullName}</Typography>
          {city || country ? <Typography variant="body2">{[city, country].join(', ')}</Typography> : null}
          {tags && <TagsWithSpacing tags={tags} />}
        </Box>
      </Box>
    </LinkNoUnderline>
  );
};

export default LeadUserCard;
