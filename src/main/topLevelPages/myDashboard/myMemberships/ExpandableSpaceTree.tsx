import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { ParseKeys } from 'i18next';
import { Button } from '@mui/material';

import Avatar from '@/core/ui/avatar/Avatar';
import Gutters from '@/core/ui/grid/Gutters';
import GridItem from '@/core/ui/grid/GridItem';
import RouterLink from '@/core/ui/link/RouterLink';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Caption, BlockTitle, BlockSectionTitle } from '@/core/ui/typography';

import { gutters } from '@/core/ui/grid/utils';
import { useScreenSize } from '@/core/ui/grid/constants';
import { MembershipProps } from './MyMembershipsDialog.model';
import { useColumns } from '@/core/ui/grid/GridContext';
import webkitLineClamp from '@/core/ui/utils/webkitLineClamp';
import { SpaceLevel, RoleName, VisualType } from '@/core/apollo/generated/graphql-schema';

import { getDefaultSpaceVisualUrl } from '@/domain/space/icons/defaultVisualUrls';

const VISIBLE_COMMUNITY_ROLES = [RoleName.Admin, RoleName.Lead];

export const ExpandableSpaceTree = ({ membership }: { membership: MembershipProps }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const columns = useColumns();

  const { t } = useTranslation();

  const { isSmallScreen } = useScreenSize();

  const toggleExpanded = () => setIsExpanded(wasExpanded => !wasExpanded);

  const paddingLeftMap = {
    [SpaceLevel.L0]: 0,
    [SpaceLevel.L1]: 5,
    [SpaceLevel.L2]: 10,
  };
  const {
    childMemberships,
    space: {
      id,
      level,
      community,
      about: {
        profile: { url, tagline, cardBanner, displayName },
      },
    },
  } = membership;
  const avatar = cardBanner?.uri;
  const roles = community?.roleSet?.myRoles;
  const paddingLeft = paddingLeftMap[level] ?? 0;
  const verticalOffset = level === SpaceLevel.L0 ? 1 : 0.5;
  const communityRoles = roles?.filter(role => VISIBLE_COMMUNITY_ROLES.includes(role)).sort();

  return (
    <>
      <GridItem columns={columns}>
        <Gutters
          marginY={0}
          paddingRight={0}
          flexDirection="row"
          paddingLeft={paddingLeft}
          paddingY={gutters(verticalOffset)}
        >
          <BadgeCardView
            to={url}
            sx={{ flexGrow: 1 }}
            component={RouterLink}
            visual={
              <Avatar
                src={avatar || getDefaultSpaceVisualUrl(VisualType.Card, id)}
                alt={displayName ? t('common.avatar-of', { user: displayName }) : t('common.avatar')}
              >
                {displayName[0] ?? '?'}
              </Avatar>
            }
          >
            <BlockTitle sx={isSmallScreen ? webkitLineClamp(2) : undefined}>{displayName}</BlockTitle>

            {tagline ? (
              <BlockSectionTitle sx={isSmallScreen ? webkitLineClamp(2) : undefined}>{tagline}</BlockSectionTitle>
            ) : null}

            {isSmallScreen && (
              <Caption color="primary">
                {communityRoles?.map(role => t(`common.roles.${role}` as ParseKeys)).join(', ')}
              </Caption>
            )}
          </BadgeCardView>

          <Gutters flexDirection="row" disableGap padding={0}>
            {!isSmallScreen && (
              <Caption color="primary" display="flex" alignItems="center">
                {communityRoles?.map(role => t(`common.roles.${role}` as ParseKeys)).join(', ')}
              </Caption>
            )}

            <Button
              sx={{ visibility: childMemberships?.length ? 'visible' : 'hidden' }}
              endIcon={isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              onClick={toggleExpanded}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? t('buttons.collapse') : t('buttons.expand')}
            />
          </Gutters>
        </Gutters>
      </GridItem>

      {isExpanded &&
        childMemberships?.map((childMembership: MembershipProps) => (
          <ExpandableSpaceTree key={childMembership.space.id} membership={childMembership} />
        ))}
    </>
  );
};
