import React, { FC } from 'react';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import Avatar from '@/core/ui/avatar/Avatar';
import { BlockSectionTitle } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';
import RouterLink from '@/core/ui/link/RouterLink';
import defaultJourneyCardBanner from '@/domain/journey/defaultVisuals/Card.jpg';

// TODO: add cardBanner if we want support of Spaces as BOK
export interface BasicSpaceProps {
  avatar?: {
    uri: string;
  };
  displayName: string;
  tagline?: string;
  url: string;
}

interface Props {
  space: BasicSpaceProps | undefined;
}

const BasicSpaceCard: FC<Props> = ({ space }) => {
  const { t } = useTranslation();

  if (!space) {
    return null;
  }

  return (
    <BadgeCardView
      visual={
        <Avatar
          src={space.avatar?.uri || defaultJourneyCardBanner}
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
