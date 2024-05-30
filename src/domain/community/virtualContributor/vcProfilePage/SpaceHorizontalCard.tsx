import React, { FC } from 'react';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import Avatar from '../../../../core/ui/avatar/Avatar';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import { theme } from '../../../../core/ui/themes/default/Theme';
import RouterLink from '../../../../core/ui/link/RouterLink';
import defaultJourneyCardBanner from '../../../../domain/journey/defaultVisuals/Card.jpg';

// TODO: add cardBanner if we want support of Spaces as BOK
export interface BokProps {
  bokProfile:
    | {
        avatar?: {
          uri: string;
        };
        displayName: string;
        tagline: string;
        url: string;
      }
    | undefined;
  showDefaults?: boolean;
}

const DEFULT_BOK = {
  avatar: {
    uri: 'https://alkem.io/api/private/rest/storage/document/1057e0c1-2d47-4821-8848-20ec19cb2a0d',
  },
  displayName: 'Welcome @ Alkemio!',
  tagline: 'Take 5 minutes to get started',
  url: 'https://alkem.io/welcome-space',
};

const SpaceHorizontalCard: FC<BokProps> = ({ bokProfile, showDefaults }) => {
  const { t } = useTranslation();

  const bodyOfKnowledge = bokProfile ? bokProfile : showDefaults ? DEFULT_BOK : undefined;

  if (!bodyOfKnowledge) {
    return null;
  }

  return (
    <BadgeCardView
      marginTop={theme.spacing(2)}
      visual={
        <Avatar
          src={bodyOfKnowledge.avatar?.uri || defaultJourneyCardBanner}
          aria-label="User avatar"
          alt={t('common.avatar-of', { user: bodyOfKnowledge.displayName })}
        >
          {bodyOfKnowledge.displayName}
        </Avatar>
      }
      component={RouterLink}
      to={bodyOfKnowledge.url}
    >
      <BlockSectionTitle>{bodyOfKnowledge.displayName}</BlockSectionTitle>
      <BlockSectionTitle>{bodyOfKnowledge.tagline}</BlockSectionTitle>
    </BadgeCardView>
  );
};

export default SpaceHorizontalCard;
