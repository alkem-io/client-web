import { HTMLAttributes, ReactNode } from 'react';
import { AvatarProps, Box } from '@mui/material';
import ErrorHandlingAvatar from './ErrorHandlingAvatar';
import { gutters } from '../grid/utils';

export type AvatarSize = 'small' | 'medium' | 'regular' | 'large';

const AvatarSizes: Record<AvatarSize, number> = {
  small: 1.5,
  medium: 2,
  regular: 3,
  large: 4,
};

export interface SizeableAvatarProps {
  size?: AvatarSize;
  overlay?: ReactNode;
}

const Avatar = ({
  size,
  sx,
  overlay,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>;
} & AvatarProps &
  SizeableAvatarProps) => {
  const avatarSize = size && AvatarSizes[size];
  const { ref } = props;

  if (overlay) {
    return (
      <Box ref={ref} position="relative">
        <Avatar size={size} sx={sx} {...props} />
        <Box
          position="absolute"
          top={0}
          left={0}
          bottom={0}
          right={0}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          {overlay}
        </Box>
      </Box>
    );
  }

  return (
    <ErrorHandlingAvatar
      sx={{
        borderRadius: 0.5,
        width: avatarSize && gutters(avatarSize),
        height: avatarSize && gutters(avatarSize),
        ...sx,
      }}
      {...props}
    />
  );
};

export default Avatar;
