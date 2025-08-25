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

export interface CustomAvatarProps extends AvatarProps {
  size?: AvatarSize;
  overlay?: ReactNode;
  ariaLabel?: string;
  src?: string;
  alt?: string;
}

const Avatar = ({
  size,
  sx,
  overlay,
  ref,
  ariaLabel,
  alt,
  src,
  key,
}: HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>;
} & CustomAvatarProps) => {
  const avatarSize = size && AvatarSizes[size];

  if (overlay) {
    return (
      <Box ref={ref} position="relative">
        <Avatar key={key} size={size} sx={sx} alt={alt} ariaLabel={ariaLabel} src={src} />
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
      key={key}
      sx={{
        borderRadius: 0.5,
        width: avatarSize && gutters(avatarSize),
        height: avatarSize && gutters(avatarSize),
        ...sx,
      }}
      ref={ref}
      alt={alt}
      ariaLabel={ariaLabel}
      src={src}
    />
  );
};

export default Avatar;
