import { PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import Icon, { IconProps } from '../icon/Icon';
import { Caption } from '@/core/ui/typography';
interface MessageCounterProps
  extends PropsWithChildren<{
    commentsCount: number | undefined;
    size?: IconProps['size'];
  }> {}

const MessageCounter = ({ commentsCount, size = 'medium' }: MessageCounterProps) => (
  <Box display="flex" alignItems="center" gap={0.75} paddingX={0.5}>
    <Icon iconComponent={ForumOutlinedIcon} color="primary" size={size} />
    <Caption color="textPrimary">{commentsCount ?? ' '}</Caption>
  </Box>
);

export default MessageCounter;
