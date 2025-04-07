import BadgeCardView from '@/core/ui/list/BadgeCardView';
import Avatar from '@/core/ui/avatar/Avatar';
import { BlockSectionTitle } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';
import RouterLink from '@/core/ui/link/RouterLink';
import { defaultVisualUrls } from '@/domain/space/icons/defaultVisualUrls';
import { VisualType } from '@/core/apollo/generated/graphql-schema';

// TODO: add cardBanner if we want support of Spaces as BOK
export interface BasicSpaceProps {
  avatar?: {
    uri: string;
  };
  displayName: string;
  tagline?: string;
  url: string;
}

const BasicSpaceCard = ({ space }: { space: BasicSpaceProps | undefined }) => {
  const { t } = useTranslation();

  if (!space) {
    return null;
  }

  return (
    <BadgeCardView
      visual={
        <Avatar
          src={space.avatar?.uri || defaultVisualUrls[VisualType.Card]}
          alt={t('common.avatar-of', { user: space.displayName })}
        >
          {space.displayName}
        </Avatar>
      }
      component={RouterLink}
      to={space.url}
    >
      <BlockSectionTitle>{space.displayName}</BlockSectionTitle>
      <BlockSectionTitle>{space.tagline}</BlockSectionTitle>
    </BadgeCardView>
  );
};

export default BasicSpaceCard;
