import React from 'react';
import { Badge, Box } from '@mui/material';
import { gutters } from '../../../../core/ui/grid/utils';
import RoundedIcon from '../../../../core/ui/icon/RoundedIcon';
import { BlockTitle, Caption } from '../../../../core/ui/typography/components';
import { CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import { AspectIcon } from '../../aspect/icon/AspectIcon';
import { CanvasIcon } from '../../canvas/icon/CanvasIcon';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';

interface TopCalloutProps {
  title: string;
  description: string;
  activity: number;
  type: CalloutType;
}

const TopCalloutDetails = ({ title, description, activity, type }: TopCalloutProps) => {
  return (
    <Box display="flex" alignItems="center" height={gutters(3)} paddingX={1} gap={1}>
      <Badge
        badgeContent={activity}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        {type === CalloutType.Card && (
          <RoundedIcon flexShrink={0} marginLeft={0.5} size="medium" component={AspectIcon} />
        )}
        {type === CalloutType.Canvas && (
          <RoundedIcon flexShrink={0} marginLeft={0.5} size="medium" component={CanvasIcon} />
        )}
        {type === CalloutType.Comments && (
          <RoundedIcon flexShrink={0} marginLeft={0.5} size="medium" component={ForumOutlinedIcon} />
        )}
      </Badge>

      <Box flex={1} flexBasis={0} paddingX={0.5} overflow="hidden">
        <BlockTitle noWrap>{title}</BlockTitle>
        <Caption noWrap>{description}</Caption>
      </Box>
    </Box>
  );
};

export default TopCalloutDetails;
