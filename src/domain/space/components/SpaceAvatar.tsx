import { SxProps, Theme } from '@mui/material';
import Avatar, { AvatarSize, SizeableAvatarProps } from '@/core/ui/avatar/Avatar';
import { getDefaultSpaceVisualUrl } from '@/domain/space/icons/defaultVisualUrls';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';

interface SpaceAvatarProps extends SizeableAvatarProps {
  src?: string;
  alt?: string;
  sx?: SxProps<Theme> | undefined;
  size?: AvatarSize;
  spaceId?: string;
}

const SpaceAvatar = ({
  ref,
  src,
  alt,
  size = 'large',
  spaceId,
  ...props
}: SpaceAvatarProps & {
  ref?: React.RefObject<HTMLDivElement>;
}) => {
  const { t } = useTranslation();
  return (
    <Avatar
      ref={ref}
      size={size}
      src={src || getDefaultSpaceVisualUrl(VisualType.Avatar, spaceId)}
      alt={alt ? t('common.avatar-of', { user: alt }) : ''}
      {...props}
    />
  );
};

export default SpaceAvatar;
