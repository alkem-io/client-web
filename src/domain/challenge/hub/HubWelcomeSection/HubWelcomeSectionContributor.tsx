import { Avatar } from '@mui/material';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import getLocationString, { Location } from '../../../../core/ui/location/getLocationString';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import React from 'react';
import GridItem from '../../../../core/ui/grid/GridItem';

interface HubWelcomeSectionContributorProps {
  profile: {
    displayName: string;
    visual?: {
      uri: string;
    };
    location?: Location;
  };
}

const HubWelcomeSectionContributor = ({ profile }: HubWelcomeSectionContributorProps) => {
  return (
    <GridItem columns={2}>
      <BadgeCardView
        visual={
          <Avatar src={profile.visual?.uri} aria-label="User avatar" alt={`${profile.displayName}\`s avatar`}>
            {profile.displayName[0]}
          </Avatar>
        }
      >
        <BlockSectionTitle>{profile.displayName}</BlockSectionTitle>
        <BlockSectionTitle>{profile.location && getLocationString(profile.location)}</BlockSectionTitle>
      </BadgeCardView>
    </GridItem>
  );
};

export default HubWelcomeSectionContributor;
