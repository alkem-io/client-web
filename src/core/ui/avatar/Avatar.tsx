import { HTMLAttributes, ReactNode } from 'react';
import { AvatarProps, Box, SxProps } from '@mui/material';
import ErrorHandlingAvatar from './ErrorHandlingAvatar';
import { gutters } from '../grid/utils';
import { Theme } from '@mui/material/styles';

export type AvatarSize = 'small' | 'medium' | 'regular' | 'large';

const AvatarSizes: Record<AvatarSize, number> = {
  small: 1.5,
  medium: 2,
  regular: 3,
  large: 4,
};

export interface CustomAvatarProps {
  src?: string;
  ariaLabel?: string;
  alt?: string;
  size?: AvatarSize;
  overlay?: ReactNode;
  variant?: AvatarProps['variant'];
  sx?: SxProps<Theme>;
  ref?: React.Ref<HTMLDivElement>;
}

const Avatar = ({
  src,
  ariaLabel,
  alt,
  size,
  overlay,
  variant,
  sx,
  ref,
}: HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>;
} & AvatarProps &
  CustomAvatarProps) => {
  const avatarSize = size && AvatarSizes[size];

  if (overlay) {
    return (
      <Box ref={ref} position="relative">
        <Avatar size={size} sx={sx} src={src} ariaLabel={ariaLabel} alt={alt} variant={variant} />
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
      src={src}
      ariaLabel={ariaLabel}
      alt={alt}
      variant={variant}
    />
  );
};

export default Avatar;
