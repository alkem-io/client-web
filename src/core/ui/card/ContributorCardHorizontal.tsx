import React, { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import Avatar from '../avatar/Avatar';
import getLocationString, { Location } from '../location/getLocationString';
import BadgeCardView from '../list/BadgeCardView';
import GridItem from '../grid/GridItem';
import SwapColors from '../palette/SwapColors';
import RouterLink from '../link/RouterLink';
import { BlockSectionTitle } from '../typography';
import ContributorTooltip from './ContributorTooltip';

export interface SpaceWelcomeSectionContributorProps {
  profile:
    | {
        displayName: string;
        avatar?: {
          uri: string;
        };
        location?: Location;
        tagsets?: { tags: string[] }[];
      }
    | undefined;
  url?: string;
  onContact?: () => void;
  seamless?: boolean;
  actions?: ReactNode;
  titleEndAmendment?: ReactNode;
}

const ContributorCardHorizontal = ({
  url,
  profile,
  onContact,
  seamless = false,
  actions,
  titleEndAmendment,
}: SpaceWelcomeSectionContributorProps) => {
  const { t } = useTranslation();

  const tags = useMemo(
    () => (profile?.tagsets ? profile.tagsets.flatMap(tagset => tagset.tags) : []),
    [profile?.tagsets]
  );

  if (!seamless) {
    return (
      <SwapColors>
        <ContributorCardHorizontal profile={profile} url={url} onContact={onContact} seamless />
      </SwapColors>
    );
  }

  return (
    <>
      <GridItem columns={2}>
        <ContributorTooltip
          displayName={profile?.displayName}
          avatarSrc={profile?.avatar?.uri}
          tags={tags}
          city={profile?.location?.city}
          country={profile?.location?.country}
          isContactable={!!onContact}
          onContact={onContact}
        >
          <BadgeCardView
            visual={
              <Avatar
                src={profile?.avatar?.uri}
                aria-label="User avatar"
                alt={t('common.avatar-of', { user: profile?.displayName })}
              >
                {profile?.displayName?.[0]}
              </Avatar>
            }
            component={RouterLink}
            to={url ?? ''}
          >
            <Box display="flex" flexDirection="row" justifyContent="space-between">
              <Box display="flex" flexDirection="column">
                <BlockSectionTitle>{profile?.displayName}</BlockSectionTitle>
                <BlockSectionTitle>{profile?.location && getLocationString(profile.location)}</BlockSectionTitle>
              </Box>
              {titleEndAmendment}
            </Box>
          </BadgeCardView>
        </ContributorTooltip>
      </GridItem>
      {actions}
    </>
  );
};

export default ContributorCardHorizontal;
