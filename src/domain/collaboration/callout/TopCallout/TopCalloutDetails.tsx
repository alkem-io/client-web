import React from 'react';
import { Badge } from '@mui/material';
import RoundedIcon from '../../../../core/ui/icon/RoundedIcon';
import { BlockTitle, Caption } from '../../../../core/ui/typography/components';
import { CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import calloutIcons from '../utils/calloutIcons';
import ItemView from '../../../../core/ui/list/ItemView';
import webkitLineClamp from '../../../../core/ui/utils/webkitLineClamp';
import RouterLink from '../../../../core/ui/link/RouterLink';

interface TopCalloutProps {
  title: string;
  description: string;
  activity: number;
  type: CalloutType;
  calloutUri?: string;
}

const TopCalloutDetails = ({ title, description, activity, type, calloutUri }: TopCalloutProps) => {
  return (
    <ItemView
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
      <BlockTitle noWrap>{title}</BlockTitle>
      <Caption sx={webkitLineClamp(2)}>{description}</Caption>
    </ItemView>
  );
};

export default TopCalloutDetails;
