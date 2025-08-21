import Avatar, { CustomAvatarProps } from '@/core/ui/avatar/Avatar';
import { getDefaultSpaceVisualUrl } from '@/domain/space/icons/defaultVisualUrls';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import { Key } from 'react';

interface SpaceAvatarProps extends CustomAvatarProps {
  spaceId?: string;
  key?: Key | null | undefined;
}

const SpaceAvatar = ({
  ref,
  key,
  src,
  alt,
  size = 'large',
  spaceId,
  sx,
}: SpaceAvatarProps & {
  ref?: React.RefObject<HTMLDivElement>;
}) => {
  const { t } = useTranslation();
  return (
    <Avatar
      ref={ref}
      key={key}
      size={size}
      src={src || getDefaultSpaceVisualUrl(VisualType.Avatar, spaceId)}
      alt={alt ? t('common.avatar-of', { user: alt }) : t('common.avatar')}
      sx={sx}
    />
  );
};

export default SpaceAvatar;
