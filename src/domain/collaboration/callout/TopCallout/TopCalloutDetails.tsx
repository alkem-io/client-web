import React from 'react';
import { Badge } from '@mui/material';
import RoundedIcon from '@core/ui/icon/RoundedIcon';
import { BlockSectionTitle, CardText } from '@core/ui/typography/components';
import { CalloutType } from '@core/apollo/generated/graphql-schema';
import calloutIcons from '../utils/calloutIcons';
import BadgeCardView from '@core/ui/list/BadgeCardView';
import webkitLineClamp from '@core/ui/utils/webkitLineClamp';
import RouterLink from '@core/ui/link/RouterLink';
import WrapperMarkdown from '@core/ui/markdown/WrapperMarkdown';
import { gutters } from '@core/ui/grid/utils';

interface TopCalloutProps {
  title: string;
  description: string;
  activity: number;
  type: CalloutType;
  calloutUri?: string;
}

const TopCalloutDetails = ({ title, description, activity, type, calloutUri }: TopCalloutProps) => {
  return (
    <BadgeCardView
      component={RouterLink}
      to={calloutUri}
      visual={
        <Badge
          badgeContent={activity}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          overlap="circular"
          sx={{
            '.MuiBadge-badge': theme => ({
              color: theme.palette.getContrastText(theme.palette.primary.dark),
              backgroundColor: theme.palette.primary.dark,
            }),
          }}
        >
          <RoundedIcon
            flexShrink={0}
            size="medium"
            component={calloutIcons[type]}
            sx={{ backgroundColor: 'primary.main' }}
          />
        </Badge>
      }
    >
      <BlockSectionTitle noWrap>{title}</BlockSectionTitle>
      <CardText
        sx={{
          ...webkitLineClamp(2),
          img: {
            maxHeight: gutters(2),
          },
        }}
      >
        <WrapperMarkdown card plain multiline>
          {description}
        </WrapperMarkdown>
      </CardText>
    </BadgeCardView>
  );
};

export default TopCalloutDetails;
