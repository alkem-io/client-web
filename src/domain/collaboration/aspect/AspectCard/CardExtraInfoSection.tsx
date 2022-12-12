import React, { PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import Icon from '../../../../core/ui/icon/Icon';
import { Caption } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';

interface CardExtraInfoSectionProps {
  createdDate: Date | undefined;
  commentsCount: number | undefined;
}

const CardExtraInfoSection = ({ createdDate, commentsCount = 0 }: PropsWithChildren<CardExtraInfoSectionProps>) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" height={gutters(2)} paddingX={1}>
      {createdDate && <Caption paddingX={0.5}>{createdDate?.toLocaleDateString()}</Caption>}
      <Box display="flex" alignItems="center" gap={0.75} paddingX={0.5}>
        <Icon iconComponent={ForumOutlinedIcon} size="medium" />
        <Caption>{commentsCount}</Caption>
      </Box>
    </Box>
  );
};

export default CardExtraInfoSection;
