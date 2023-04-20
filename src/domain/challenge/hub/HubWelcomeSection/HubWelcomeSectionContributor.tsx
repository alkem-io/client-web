import { Avatar, Tooltip } from '@mui/material';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import getLocationString, { Location } from '../../../../core/ui/location/getLocationString';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import React from 'react';
import GridItem from '../../../../core/ui/grid/GridItem';
import UserCard from '../../../../common/components/composite/common/cards/user-card/UserCard';
import SwapColors from '../../../../core/ui/palette/SwapColors';
import LinkNoUnderline from '../../../shared/components/LinkNoUnderline';

interface HubWelcomeSectionContributorProps {
  profile: {
    displayName: string;
    visual?: {
      uri: string;
    };
    location?: Location;
    tagset?: { tags: string[] };
  };
  url: string;
}

const HubWelcomeSectionContributor = ({ url, profile }: HubWelcomeSectionContributorProps) => {
  return (
    <SwapColors>
      <GridItem columns={2}>
        <Tooltip
          arrow
          title={
            <UserCard
              displayName={profile.displayName}
              avatarSrc={profile.visual?.uri}
              tags={profile.tagset?.tags ?? []}
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
                alt={`${profile.displayName}\`s avatar`}
                variant="square"
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

export default HubWelcomeSectionContributor;
