import Avatar from '../avatar/Avatar';
import { BlockSectionTitle } from '../typography';
import getLocationString, { Location } from '../location/getLocationString';
import BadgeCardView from '../list/BadgeCardView';
import React from 'react';
import GridItem from '../grid/GridItem';
import SwapColors from '../palette/SwapColors';
import { useTranslation } from 'react-i18next';
import ContributorTooltip from './ContributorTooltip';
import RouterLink from '../link/RouterLink';

export interface SpaceWelcomeSectionContributorProps {
  profile: {
    displayName: string;
    avatar?: {
      uri: string;
    };
    location?: Location;
    tagsets?: { tags: string[] }[];
  };
  url: string;
  onContact?: () => void;
  seamless?: boolean;
}

const ContributorCardHorizontal = ({
  url,
  profile,
  onContact,
  seamless = false,
}: SpaceWelcomeSectionContributorProps) => {
  const { t } = useTranslation();

  const tags = profile.tagsets ? profile.tagsets.flatMap(tagset => tagset.tags) : [];

  if (!seamless) {
    return (
      <SwapColors>
        <ContributorCardHorizontal profile={profile} url={url} onContact={onContact} seamless />
      </SwapColors>
    );
  }

  return (
    <GridItem columns={2}>
      <ContributorTooltip
        displayName={profile.displayName}
        avatarSrc={profile.avatar?.uri}
        tags={tags}
        city={profile.location?.city}
        country={profile.location?.country}
        isContactable={!!onContact}
        onContact={onContact}
      >
        <BadgeCardView
          visual={
            <Avatar
              src={profile.avatar?.uri}
              aria-label="User avatar"
              alt={t('common.avatar-of', { user: profile.displayName })}
            >
              {profile.displayName[0]}
            </Avatar>
          }
          component={RouterLink}
          to={url}
          loose
        >
          <BlockSectionTitle>{profile.displayName}</BlockSectionTitle>
          <BlockSectionTitle>{profile.location && getLocationString(profile.location)}</BlockSectionTitle>
        </BadgeCardView>
      </ContributorTooltip>
    </GridItem>
  );
};

export default ContributorCardHorizontal;
