import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import Avatar, { AvatarSize } from '../avatar/Avatar';
import getLocationString, { Location } from '../location/getLocationString';
import BadgeCardView from '../list/BadgeCardView';
import GridItem from '../grid/GridItem';
import SwapColors from '../palette/SwapColors';
import RouterLink from '../link/RouterLink';
import { BlockSectionTitle, BlockTitle, Caption } from '../typography';
import ContributorTooltip from './ContributorTooltip';
import ActionsMenu from './ActionsMenu';

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
  isContactable?: boolean;
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
  isContactable,
  onContact,
  seamless = false,
  actions,
  menuActions,
  titleEndAmendment,
  size,
  withUnifiedTitle = false,
}: ContributorCardHorizontalProps) => {
  const { t } = useTranslation();

  const tags = useMemo(
    () => (profile?.tagsets ? profile.tagsets.flatMap(tagset => tagset.tags) : []),
    [profile?.tagsets]
  );

  if (!seamless) {
    return (
      <SwapColors>
        <ContributorCardHorizontal profile={profile} onContact={onContact} isContactable={isContactable} seamless />
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
          isContactable={isContactable}
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
