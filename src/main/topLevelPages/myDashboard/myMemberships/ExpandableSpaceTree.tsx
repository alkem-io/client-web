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
import { MembershipProps, SubspaceAccessProps } from './MyMembershipsDialog';
import { CommunityRole } from '../../../../core/apollo/generated/graphql-schema';
import webkitLineClamp from '../../../../core/ui/utils/webkitLineClamp';
import isJourneyMember from '../../../../domain/journey/utils/isJourneyMember';
import { gutters } from '../../../../core/ui/grid/utils';
import { useColumns } from '../../../../core/ui/grid/GridContext';

interface ExpandableSpaceTreeProps {
  space: {
    profile: {
      displayName: string;
      tagline?: string;
      url: string;
      cardBanner?: {
        uri: string;
      };
    };
    community?: {
      myRoles?: CommunityRole[] | undefined;
    };
    level: number;
  };
  subspaces?: SubspaceAccessProps[] | undefined;
  getMembershipWithDetails: (id: string) => MembershipProps;
}

const VISIBLE_COMMUNITY_ROLES = [CommunityRole.Admin, CommunityRole.Lead];

const ExpandableSpaceTree = ({
  space: {
    profile: { displayName, tagline, cardBanner: { uri: avatar } = { uri: '' }, url },
    level,
    community: { myRoles: roles } = { myRoles: [] },
  },
  subspaces,
  getMembershipWithDetails,
}: ExpandableSpaceTreeProps) => {
  const { t } = useTranslation();

  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = () => setIsExpanded(wasExpanded => !wasExpanded);

  const communityRoles = roles?.filter(role => VISIBLE_COMMUNITY_ROLES.includes(role)).sort();

  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  const columns = useColumns();

  const verticalOffset = level === 0 ? 1 : 0.5;

  return (
    <>
      <GridItem columns={columns}>
        <Gutters
          flexDirection="row"
          paddingY={gutters(verticalOffset)}
          paddingLeft={level * 5}
          paddingRight={0}
          marginY={0}
        >
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
              <Caption color="primary">
                {communityRoles?.map(role => t(`common.enums.communityRole.${role}` as const)).join(', ')}
              </Caption>
            )}
          </BadgeCardView>
          <Gutters flexDirection="row" disableGap padding={0}>
            {!isMobile && (
              <Caption color="primary" display="flex" alignItems="center">
                {communityRoles?.map(role => t(`common.enums.communityRole.${role}` as const)).join(', ')}
              </Caption>
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
          <ExpandableSpaceTree
            key={subspace.id}
            space={getMembershipWithDetails(subspace.id)}
            subspaces={getMembershipWithDetails(subspace.id)?.subspaces?.filter(isJourneyMember)}
            getMembershipWithDetails={getMembershipWithDetails}
          />
        ))}
    </>
  );
};

export default ExpandableSpaceTree;
