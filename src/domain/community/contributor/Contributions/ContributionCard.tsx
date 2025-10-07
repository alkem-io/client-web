import { SpaceHostedItem } from '@/domain/space/models/SpaceHostedItem.model';
import useContributionProvider, {
  ContributionDetails,
} from '../../profile/useContributionProvider/useContributionProvider';
import ContributionDetailsCard from '../../profile/views/ContributionDetailsCard';
import { useState } from 'react';

export type ContributionCardProps = {
  onLeave?: () => Promise<unknown>;
  enableLeave?: boolean;
  onContributionClick?: (event: React.MouseEvent<Element, MouseEvent>, contribution: ContributionDetails) => void;
  contributionItem: SpaceHostedItem;
};

const ContributionCard = ({ contributionItem, onLeave, enableLeave, onContributionClick }: ContributionCardProps) => {
  const [leavingRoleSetId, setLeavingRoleSetId] = useState<string>();

  const { details, loading, isLeavingCommunity, leaveCommunity } = useContributionProvider({
    spaceHostedItem: contributionItem,
  });

  if (loading || !details) {
    return null;
  }

  const handleLeaveCommunity = async () => {
    await leaveCommunity();
    onLeave?.();
  };

  return (
    <ContributionDetailsCard
      {...details}
      spaceId={contributionItem.id}
      tagline={details.about.profile.tagline!}
      displayName={details.about.profile.displayName}
      enableLeave={enableLeave}
      leavingCommunity={isLeavingCommunity}
      handleLeaveCommunity={handleLeaveCommunity}
      leavingCommunityDialogOpen={!!leavingRoleSetId && leavingRoleSetId === details?.roleSetId}
      onLeaveCommunityDialogOpen={isOpen => setLeavingRoleSetId(isOpen ? details?.roleSetId : undefined)}
      banner={details.about.profile.cardBanner}
      {...(onContributionClick
        ? { onClick: event => onContributionClick(event, details) }
        : details.about.profile.url
          ? { to: details.about.profile.url }
          : {})}
    />
  );
};

export default ContributionCard;
