import { Tooltip } from '@mui/material';
import { Caption, Text } from '@/core/ui/typography/components';

const TextWithTooltip = ({ text, tooltip }: { text: string; tooltip: string }) => {
  return (
    <Tooltip arrow={true} title={<Caption sx={{ whiteSpace: 'pre-line' }}>{tooltip}</Caption>} placement="top">
      <Text>{text}</Text>
    </Tooltip>
  );
};

export default TextWithTooltip;
