import React, { PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';

import Icon from '../../../shared/components/Icon';
import { Caption } from '../../../../core/ui/typography';

interface CardExtraInfoSectionProps {
  createdDate: Date | undefined;
  messageCount: number | undefined;
}

const CardExtraInfoSection = ({ createdDate, messageCount = 0 }: PropsWithChildren<CardExtraInfoSectionProps>) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: theme => theme.spacing(1.5, 2) }}>
      {createdDate ? <Caption>{createdDate?.toLocaleDateString()}</Caption> : null}
      <Box>
        <Icon iconComponent={ForumOutlinedIcon} sx={{ marginRight: theme => theme.spacing(0.5) }} size="medium" />
        <Caption>{messageCount}</Caption>
      </Box>
    </Box>
  );
};

export default CardExtraInfoSection;
