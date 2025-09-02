import { SxProps, Theme } from '@mui/material';
import Avatar, { CustomAvatarProps } from '@/core/ui/avatar/Avatar';
import { getDefaultSpaceVisualUrl } from '@/domain/space/icons/defaultVisualUrls';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';

interface SpaceAvatarProps extends CustomAvatarProps {
  sx?: SxProps<Theme> | undefined;
  spaceId?: string;
}

const SpaceAvatar = ({
  key,
  ref,
  src,
  alt,
  ariaLabel,
  sx,
  size = 'large',
  spaceId,
}: SpaceAvatarProps & {
  ref?: React.RefObject<HTMLDivElement>;
}) => {
  const { t } = useTranslation();

  // Ensure we always have meaningful alt text for accessibility
  const altText = alt ? t('common.avatar-of', { user: alt }) : t('common.avatar');

  return (
    <Avatar
      key={key}
      size={size}
      sx={sx}
      ariaLabel={ariaLabel}
      ref={ref}
      src={src || getDefaultSpaceVisualUrl(VisualType.Avatar, spaceId)}
      alt={altText}
    />
  );
};

export default SpaceAvatar;
