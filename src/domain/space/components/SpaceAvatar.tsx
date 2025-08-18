import { SxProps, Theme } from '@mui/material';
import Avatar, { AvatarSize, SizeableAvatarProps } from '@/core/ui/avatar/Avatar';
import { getDefaultSpaceVisualUrl } from '@/domain/space/icons/defaultVisualUrls';
import { VisualType } from '@/core/apollo/generated/graphql-schema';

interface SpaceAvatarProps extends SizeableAvatarProps {
  src: string | undefined;
  sx?: SxProps<Theme> | undefined;
  size?: AvatarSize;
  spaceId?: string;
}

const SpaceAvatar = ({
  ref,
  src,
  size = 'large',
  spaceId,
  ...props
}: SpaceAvatarProps & {
  ref?: React.RefObject<HTMLDivElement>;
}) => {
  return <Avatar ref={ref} size={size} src={src || getDefaultSpaceVisualUrl(VisualType.Avatar, spaceId)} {...props} />;
};

export default SpaceAvatar;
