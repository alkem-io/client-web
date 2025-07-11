import { forwardRef } from 'react';
import { SxProps, Theme } from '@mui/material';
import Avatar, { AvatarSize, SizeableAvatarProps } from '@/core/ui/avatar/Avatar';
import { getDefaultSpaceVisualUrl } from '@/domain/space/icons/defaultVisualUrls';
import { VisualType } from '@/core/apollo/generated/graphql-schema';

interface SpaceAvatarProps extends SizeableAvatarProps {
  src: string | undefined;
  sx?: SxProps<Theme> | undefined;
  size?: AvatarSize;
  levelZeroSpaceId?: string;
}

const SpaceAvatar = forwardRef<HTMLDivElement, SpaceAvatarProps>(({ src, size = 'large', ...props }, ref) => {
  return (
    <Avatar
      ref={ref}
      size={size}
      src={src || getDefaultSpaceVisualUrl(VisualType.Avatar, props.levelZeroSpaceId)}
      {...props}
    />
  );
});

export default SpaceAvatar;
