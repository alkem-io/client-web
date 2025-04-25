import { useSpaceSubspaceCardsQuery } from '@/core/apollo/generated/apollo-hooks';
import { CommunityMembershipStatus } from '@/core/apollo/generated/graphql-schema';
import { CardLayoutContainer } from '@/domain/collaboration/callout/components/CardsLayout';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import Loading from '@/core/ui/loading/Loading';
import SpaceFilter from '@/domain/space/components/SpaceFilter';
import { spaceAboutValueGetter } from '@/domain/space/about/util/spaceAboutValueGetter';
import { useSpace } from '@/domain/space/context/useSpace';
import { DialogContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SubspaceCard from './cards/SubspaceCard';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

export interface SubspacesListDialogProps {
  open?: boolean;
  onClose?: () => void;
}

const SubspacesListDialog = ({ open = false, onClose }: SubspacesListDialogProps) => {
  const { t } = useTranslation();
  const { spaceId } = useUrlResolver();

  const { visibility } = useSpace();

  const { data, loading } = useSpaceSubspaceCardsQuery({
    variables: { spaceId: spaceId! },
    skip: !spaceId,
  });

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
            <SpaceFilter data={subspaces} valueGetter={spaceAboutValueGetter}>
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
                        level={subspace.level}
                        member={subspace.about.membership.myMembershipStatus === CommunityMembershipStatus.Member}
                      />
                    );
                  })}
                </CardLayoutContainer>
              )}
            </SpaceFilter>
          )}
        </DialogContent>
      </>
    </DialogWithGrid>
  );
};

export default SubspacesListDialog;
