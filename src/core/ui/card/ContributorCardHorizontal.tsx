import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Avatar, { type AvatarSize } from '../avatar/Avatar';
import GridItem from '../grid/GridItem';
import RouterLink from '../link/RouterLink';
import BadgeCardView from '../list/BadgeCardView';
import getLocationString, { type Location } from '../location/getLocationString';
import SwapColors from '../palette/SwapColors';
import { BlockSectionTitle, BlockTitle, Caption } from '../typography';
import ActionsMenu from './ActionsMenu';
import ContributorTooltip from './ContributorTooltip';

export interface ContributorCardHorizontalProps {
  profile:
    | {
        displayName: string;
        avatar?: {
          uri: string;
        };
        tagline?: string;
        location?: Location;
        tagsets?: { tags: string[] }[];
        url?: string;
      }
    | undefined;
  onContact?: () => void;
  seamless?: boolean;
  actions?: ReactNode;
  titleEndAmendment?: ReactNode;
  menuActions?: ReactNode;
  size?: AvatarSize;
  withUnifiedTitle?: boolean;
}

const ContributorCardHorizontal = ({
  profile,
  onContact,
  seamless = false,
  actions,
  menuActions,
  titleEndAmendment,
  size,
  withUnifiedTitle = false,
}: ContributorCardHorizontalProps) => {
  const { t } = useTranslation();

  const tags = profile?.tagsets ? profile.tagsets.flatMap(tagset => tagset.tags) : [];

  if (!seamless) {
    return (
      <SwapColors>
        <ContributorCardHorizontal profile={profile} onContact={onContact} seamless={true} />
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
                ariaLabel="User avatar"
                alt={profile?.displayName ? t('common.avatar-of', { user: profile?.displayName }) : t('common.avatar')}
                size={size}
              >
                {profile?.displayName?.[0]}
              </Avatar>
            }
            component={RouterLink}
            to={profile?.url ?? ''}
            actions={menuActions ? <ActionsMenu>{menuActions}</ActionsMenu> : undefined}
          >
            <Box display="flex" flexDirection="row" justifyContent="space-between">
              <Box display="flex" flexDirection="column">
                {withUnifiedTitle ? (
                  <BlockTitle>{profile?.displayName}</BlockTitle>
                ) : (
                  <BlockSectionTitle>{profile?.displayName}</BlockSectionTitle>
                )}
                <BlockSectionTitle>{profile?.location && getLocationString(profile.location)}</BlockSectionTitle>
                {profile?.tagline && <Caption>{profile.tagline}</Caption>}
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
