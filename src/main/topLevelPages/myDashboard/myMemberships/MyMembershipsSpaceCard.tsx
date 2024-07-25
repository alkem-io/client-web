import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Theme, useMediaQuery } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import defaultCardBanner from '../../../../domain/journey/defaultVisuals/Card.jpg';
import GridItem from '../../../../core/ui/grid/GridItem';
import Gutters from '../../../../core/ui/grid/Gutters';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import Avatar from '../../../../core/ui/avatar/Avatar';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { BlockSectionTitle, BlockTitle, Caption } from '../../../../core/ui/typography';
import { MembershipProps } from './MyMembershipsDialog';
import { CommunityRole } from '../../../../core/apollo/generated/graphql-schema';
import webkitLineClamp from '../../../../core/ui/utils/webkitLineClamp';

interface MyMembershipsSpaceCardProps {
  displayName: string;
  tagline?: string;
  avatar?: string;
  url: string;
  roles?: CommunityRole[];
  level: number;
  subspaces: MembershipProps[] | undefined;
}

const VISIBLE_COMMUNITY_ROLES = [CommunityRole.Admin, CommunityRole.Lead];

const MyMembershipsSpaceCard = ({
  displayName,
  tagline,
  avatar,
  url,
  roles,
  level,
  subspaces,
}: MyMembershipsSpaceCardProps) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = () => setIsExpanded(wasExpanded => !wasExpanded);

  const communityRoles = roles
    ?.filter(role => VISIBLE_COMMUNITY_ROLES.includes(role))
    .map(role => role.toLowerCase())
    .sort();

  return (
    <>
      <GridItem columns={12}>
        <Gutters flexDirection="row" paddingY={isMobile ? 0.5 : 0} paddingLeft={level * 5} paddingRight={0} marginY={0}>
          <BadgeCardView
            visual={
              <Avatar
                src={avatar || defaultCardBanner}
                aria-label="Space avatar"
                alt={t('common.avatar-of', { space: displayName })}
              >
                {displayName[0]}
              </Avatar>
            }
            component={RouterLink}
            to={url}
            sx={{ flexGrow: 1 }}
          >
            <BlockTitle sx={isMobile ? webkitLineClamp(2) : undefined}>{displayName}</BlockTitle>
            <BlockSectionTitle sx={isMobile ? webkitLineClamp(2) : undefined}>{tagline}</BlockSectionTitle>
            {isMobile && (
              <Caption color="primary">{communityRoles?.map(role => t(`common.${role}` as const)).join(', ')}</Caption>
            )}
          </BadgeCardView>
          <Gutters flexDirection="row">
            {!isMobile && (
              <Caption color="primary">{communityRoles?.map(role => t(`common.${role}` as const)).join(', ')}</Caption>
            )}
            <Button
              onClick={toggleExpanded}
              endIcon={isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              sx={{ visibility: subspaces?.length ? 'visible' : 'hidden' }}
              area-label={isExpanded ? t('buttons.collapse') : t('buttons.expand')}
            />
          </Gutters>
        </Gutters>
      </GridItem>
      {isExpanded &&
        subspaces?.map(subspace => (
          <MyMembershipsSpaceCard
            key={subspace.id}
            displayName={subspace.profile.displayName}
            tagline={subspace.profile.tagline}
            avatar={subspace.profile.cardBanner?.uri}
            url={subspace.profile.url}
            roles={subspace.community?.myRoles}
            level={subspace.level}
            subspaces={subspace.subspaces}
          />
        ))}
    </>
  );
};

export default MyMembershipsSpaceCard;
