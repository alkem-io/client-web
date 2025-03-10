import { useSpaceSubspaceCardsQuery } from '@/core/apollo/generated/apollo-hooks';
import { CommunityMembershipStatus } from '@/core/apollo/generated/graphql-schema';
import { CardLayoutContainer } from '@/core/ui/card/cardsLayout/CardsLayout';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import Loading from '@/core/ui/loading/Loading';
import JourneyFilter from '@/domain/journey/common/JourneyFilter/JourneyFilter';
import { journeyCardValueGetter } from '@/domain/journey/common/utils/journeyCardValueGetter';
import { useSpace } from '@/domain/space/SpaceContext/useSpace';
import SubspaceCard from '@/domain/journey/subspace/subspaceCard/SubspaceCard';
import { DialogContent } from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface SubspacesListDialogProps {
  open?: boolean;
  onClose?: () => void;
  spaceId: string;
}

const SubspacesListDialog = ({ open = false, spaceId, onClose }: SubspacesListDialogProps) => {
  const { t } = useTranslation();
  const { visibility } = useSpace();

  const { data, loading, subscribeToMore } = useSpaceSubspaceCardsQuery({
    variables: { spaceId: spaceId! },
    skip: !spaceId,
  });

  // @ts-ignore react-18
  useSubSpaceCreatedSubscription(data, data => data?.lookup.space, subscribeToMore);
  const space = data?.lookup.space;

  const subspaces = space?.subspaces ?? [];

  return (
    <DialogWithGrid open={open} fullWidth columns={12}>
      <>
        <DialogHeader
          onClose={onClose}
          title={t('common.entitiesWithCount', {
            entityType: t('common.subspaces'),
            count: subspaces.length,
          })}
        />
        <DialogContent>
          {loading && <Loading />}
          {!loading && subspaces.length > 0 && (
            <JourneyFilter data={subspaces} valueGetter={journeyCardValueGetter}>
              {filteredEntities => (
                <CardLayoutContainer>
                  {filteredEntities.map((subspace, index) => {
                    const key = subspace ? subspace.id : `__loading_${index}`;
                    return (
                      <SubspaceCard
                        key={key}
                        displayName={subspace.about.profile.displayName}
                        banner={subspace.about.profile.cardBanner}
                        tags={subspace.about.profile.tagset?.tags!}
                        tagline={subspace.about.profile.tagline!}
                        vision={subspace.about.why!}
                        journeyUri={subspace.about.profile.url}
                        locked={!subspace.about.isContentPublic}
                        spaceVisibility={visibility}
                        member={subspace.about.membership.myMembershipStatus === CommunityMembershipStatus.Member}
                      />
                    );
                  })}
                </CardLayoutContainer>
              )}
            </JourneyFilter>
          )}
        </DialogContent>
      </>
    </DialogWithGrid>
  );
};

export default SubspacesListDialog;
