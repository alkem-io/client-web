import { SpaceLevel, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import { BlockTitle, Caption } from '@/core/ui/typography';
import SpaceCardBase, { SpaceCardProps } from '@/domain/space/components/cards/SpaceCardBase';
import SpaceCardTagline from '@/domain/space/components/cards/components/SpaceCardTagline';
import SpaceLeads, { Lead, LeadOrganization } from './components/SpaceLeads';
import SpaceParentInfo, { ParentInfo } from './components/SpaceParentInfo';
import StackedAvatar from './components/StackedAvatar';
import SpaceCardTagsOverlay from './components/SpaceCardTagsOverlay';
import SpaceVisibilityBanner from './components/SpaceVisibilityBanner';
import { Box } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';

interface SubspaceCardProps extends Omit<SpaceCardProps, 'header'> {
  spaceId?: string;
  tagline?: string | null;
  displayName: string;
  vision?: string;
  member?: boolean;
  spaceUri?: string;
  spaceVisibility?: SpaceVisibility;
  parentInfo?: ParentInfo;
  hideJoin?: boolean;
  isPrivate?: boolean;
  avatarUris?: { src: string; alt: string }[];
  level?: SpaceLevel;
  leadUsers?: Lead[];
  leadOrganizations?: LeadOrganization[];
  showLeads?: boolean;
}

const SubspaceCard = ({
  displayName,
  vision,
  tagline,
  spaceVisibility,
  level,
  member,
  parentInfo,
  isPrivate,
  avatarUris,
  leadUsers,
  leadOrganizations,
  showLeads = false,
  tags,
  ...props
}: SubspaceCardProps) => {
  const isSubspace = level !== SpaceLevel.L0;

  // Show avatarUris as visual in BadgeCardView (next to displayName) if provided
  const hasAvatarUris = Boolean(avatarUris && avatarUris.length > 0);
  const visualContent = hasAvatarUris ? <StackedAvatar avatarUris={avatarUris!} /> : undefined;

  // Show leads at the bottom of the card if authenticated
  const hasLeads = Boolean(showLeads && (leadUsers?.length || leadOrganizations?.length));

  // Show visibility banner for non-Active spaces
  const showVisibilityBanner = Boolean(spaceVisibility && spaceVisibility !== SpaceVisibility.Active);

  return (
    <SpaceCardBase
      header={
        <Box display="flex" flexDirection="column" gap={0} width="100%">
          <BlockTitle
            noWrap
            component="dt"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {displayName}
          </BlockTitle>
          {isSubspace && parentInfo && <SpaceParentInfo parent={parentInfo} />}
        </Box>
      }
      visual={visualContent}
      locked={isPrivate}
      bannerOverlay={
        <>
          {showVisibilityBanner && <SpaceVisibilityBanner visibility={spaceVisibility} />}
          {tags && tags.length > 0 && <SpaceCardTagsOverlay tags={tags} />}
        </>
      }
      tags={undefined}
      {...props}
    >
      <SpaceCardTagline>{tagline ?? ''}</SpaceCardTagline>
      {hasLeads && (
        <Box sx={{ display: 'flex', alignItems: 'center', paddingTop: gutters(0.5) }}>
          <Caption>Led by:</Caption>
          <SpaceLeads leadUsers={leadUsers} leadOrganizations={leadOrganizations} showLeads={showLeads} />
        </Box>
      )}
    </SpaceCardBase>
  );
};

export default SubspaceCard;
