import { Avatar } from '@mui/material';
import { BlockSectionTitle } from '../typography';
import getLocationString, { Location } from '../location/getLocationString';
import BadgeCardView from '../list/BadgeCardView';
import React from 'react';
import GridItem from '../grid/GridItem';
import SwapColors from '../palette/SwapColors';
import LinkNoUnderline from '../../../domain/shared/components/LinkNoUnderline';
import { useTranslation } from 'react-i18next';
import ContributorTooltip from './ContributorTooltip';

interface SpaceWelcomeSectionContributorProps {
  profile: {
    displayName: string;
    visual?: {
      uri: string;
    };
    location?: Location;
    tagsets?: { tags: string[] }[];
  };
  url: string;
  onContact?: () => void;
}

const ContributorCardHorizontal = ({ url, profile, onContact }: SpaceWelcomeSectionContributorProps) => {
  const { t } = useTranslation();

  const tags = profile.tagsets ? profile.tagsets.flatMap(tagset => tagset.tags) : [];

  return (
    <SwapColors>
      <GridItem columns={2}>
        <ContributorTooltip
          displayName={profile.displayName}
          avatarSrc={profile.visual?.uri}
          tags={tags}
          city={profile.location?.city}
          country={profile.location?.country}
          isContactable={!!onContact}
          onContact={onContact}
        >
          <BadgeCardView
            visual={
              <Avatar
                src={profile.visual?.uri}
                aria-label="User avatar"
                alt={t('common.avatar-of', { user: profile.displayName })}
              >
                {profile.displayName[0]}
              </Avatar>
            }
            component={LinkNoUnderline}
            to={url}
          >
            <BlockSectionTitle>{profile.displayName}</BlockSectionTitle>
            <BlockSectionTitle>{profile.location && getLocationString(profile.location)}</BlockSectionTitle>
          </BadgeCardView>
        </ContributorTooltip>
      </GridItem>
    </SwapColors>
  );
};

export default ContributorCardHorizontal;
