import { Avatar, Tooltip } from '@mui/material';
import { BlockSectionTitle } from '../typography';
import getLocationString, { Location } from '../location/getLocationString';
import BadgeCardView from '../list/BadgeCardView';
import React from 'react';
import GridItem from '../grid/GridItem';
import UserCard from '../../../common/components/composite/common/cards/user-card/UserCard';
import SwapColors from '../palette/SwapColors';
import LinkNoUnderline from '../../../domain/shared/components/LinkNoUnderline';
import { useTranslation } from 'react-i18next';

interface HubWelcomeSectionContributorProps {
  profile: {
    displayName: string;
    visual?: {
      uri: string;
    };
    location?: Location;
    tagsets?: { tags: string[] }[];
  };
  url: string;
}

const ContributorCardHorizontal = ({ url, profile }: HubWelcomeSectionContributorProps) => {
  const { t } = useTranslation();

  const tags = profile.tagsets ? profile.tagsets.flatMap(tagset => tagset.tags) : [];

  return (
    <SwapColors>
      <GridItem columns={2}>
        <Tooltip
          arrow
          title={
            <UserCard
              displayName={profile.displayName}
              avatarSrc={profile.visual?.uri}
              tags={tags}
              city={profile.location?.city}
              country={profile.location?.country}
            />
          }
          componentsProps={{ popper: { sx: { '.MuiTooltip-tooltip': { backgroundColor: 'transparent' } } } }}
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
        </Tooltip>
      </GridItem>
    </SwapColors>
  );
};

export default ContributorCardHorizontal;
