import React, { FC } from 'react';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import Avatar from '../../../../core/ui/avatar/Avatar';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import { theme } from '../../../../core/ui/themes/default/Theme';
import RouterLink from '../../../../core/ui/link/RouterLink';
import defaultJourneyCardBanner from '../../../../domain/journey/defaultVisuals/Card.jpg';

// TODO: add cardBanner if we want support of Spaces as BOK
export interface BasicSpaceProps {
  avatar?: {
    uri: string;
  };
  displayName: string;
  tagline: string;
  url: string;
}

interface Props {
  space: BasicSpaceProps | undefined;
  showDefaults?: boolean;
}

const DEFULT_SPACE_DATA = {
  avatar: {
    uri: 'https://alkem.io/api/private/rest/storage/document/1057e0c1-2d47-4821-8848-20ec19cb2a0d',
  },
  displayName: 'Welcome @ Alkemio!',
  tagline: 'Take 5 minutes to get started',
  url: 'https://alkem.io/welcome-space',
};

const BasicSpaceCard: FC<Props> = ({ space, showDefaults }) => {
  const { t } = useTranslation();

  const spaceData = space ? space : showDefaults ? DEFULT_SPACE_DATA : undefined;

  if (!spaceData) {
    return null;
  }

  return (
    <BadgeCardView
      marginTop={theme.spacing(2)}
      visual={
        <Avatar
          src={spaceData.avatar?.uri || defaultJourneyCardBanner}
          alt={t('common.avatar-of', { user: spaceData.displayName })}
        >
          {spaceData.displayName}
        </Avatar>
      }
      component={RouterLink}
      to={spaceData.url}
    >
      <BlockSectionTitle>{spaceData.displayName}</BlockSectionTitle>
      <BlockSectionTitle>{spaceData.tagline}</BlockSectionTitle>
    </BadgeCardView>
  );
};

export default BasicSpaceCard;
