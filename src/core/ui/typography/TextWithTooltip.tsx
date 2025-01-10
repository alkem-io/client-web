import { Tooltip } from '@mui/material';
import { Caption, Text } from '@/core/ui/typography/components';
import React from 'react';

const TextWithTooltip = ({ text, tooltip }: { text: string; tooltip: string }) => {
  return (
    <Tooltip arrow title={<Caption>{tooltip}</Caption>} placement="top">
      <Text>{text}</Text>
    </Tooltip>
  );
};

export default TextWithTooltip;
