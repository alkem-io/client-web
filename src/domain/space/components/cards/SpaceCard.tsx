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
  spaceUri?: string;
  spaceVisibility?: SpaceVisibility;
  parentInfo?: ParentInfo;
  isPrivate?: boolean;
  avatarUris?: { src: string; alt: string }[];
  level?: SpaceLevel;
  leadUsers?: Lead[];
  leadOrganizations?: LeadOrganization[];
  showLeads?: boolean;
  compact?: boolean;
}

const SpaceCard = ({
  displayName,
  tagline,
  spaceVisibility,
  level = SpaceLevel.L0,
  parentInfo,
  isPrivate,
  avatarUris,
  leadUsers,
  leadOrganizations,
  showLeads = false,
  compact = false,
  tags,
  ...props
}: SubspaceCardProps) => {
  const isSubspace = level !== SpaceLevel.L0;

  // Show avatarUris as visual in BadgeCardView (next to displayName) if provided
  const hasAvatarUris = Boolean(avatarUris && avatarUris.length > 0);
  const visualContent = hasAvatarUris ? <StackedAvatar avatarUris={avatarUris!} /> : undefined;

  // Show leads at the bottom of the card if authenticated (and not in compact mode)
  const hasLeads = Boolean(!compact && showLeads && (leadUsers?.length || leadOrganizations?.length));

  // Show visibility banner for non-Active spaces
  const showVisibilityBanner = Boolean(spaceVisibility && spaceVisibility !== SpaceVisibility.Active);

  // Compact mode uses a completely different layout (tile-style)
  if (compact) {
    return (
      <SpaceCardBase
        header={null}
        banner={props.banner}
        spaceId={props.spaceId}
        locked={isPrivate}
        visual={visualContent}
        bannerOverlay={tags && tags.length > 0 ? <SpaceCardTagsOverlay tags={tags} compact /> : undefined}
        sx={{
          position: 'relative',
          height: '100%',
          '& .MuiCardContent-root': { display: 'none' },
        }}
        {...props}
      >
        {/* Display name and optional parent info - rendered in BadgeCardView footer */}
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
      </SpaceCardBase>
    );
  }

  // Regular mode - standard card layout
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

      {showLeads && (
        <Box sx={{ display: 'flex', alignItems: 'center', paddingTop: gutters(0.5) }}>
          <Caption>{hasLeads ? 'Led by:' : 'No lead yet'}</Caption>
          {hasLeads ? (
            <SpaceLeads leadUsers={leadUsers} leadOrganizations={leadOrganizations} showLeads={showLeads} />
          ) : (
            <SpaceLeads showLeads={showLeads} />
          )}
        </Box>
      )}
    </SpaceCardBase>
  );
};

export default SpaceCard;
