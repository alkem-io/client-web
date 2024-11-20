import { useTranslation } from 'react-i18next';
import { journeyCardValueGetter } from '@/domain/journey/common/utils/journeyCardValueGetter';
import { useSpace } from '@/domain/journey/space/SpaceContext/useSpace';
import SubspaceCard from '@/domain/journey/subspace/subspaceCard/SubspaceCard';
import SubspacesContainer from '@/domain/journey/space/containers/SubspacesContainer';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { DialogContent } from '@mui/material';
import { CommunityMembershipStatus, SpacePrivacyMode } from '@/core/apollo/generated/graphql-schema';
import { CardLayoutContainer } from '@/core/ui/card/cardsLayout/CardsLayout';
import JourneyFilter from '@/domain/journey/common/JourneyFilter/JourneyFilter';
import Loading from '@/core/ui/loading/Loading';

export interface SubspacesListDialogProps {
  open?: boolean;
  onClose?: () => void;
  journeyId: string;
}

const SubspacesListDialog = ({ open = false, journeyId, onClose }: SubspacesListDialogProps) => {
  const { t } = useTranslation();
  const { visibility } = useSpace();

  return (
    <DialogWithGrid open={open} fullWidth columns={12}>
      <SubspacesContainer spaceId={journeyId}>
        {({ subspaces }, state) => (
          <>
            <DialogHeader
              onClose={onClose}
              title={t('common.entitiesWithCount', {
                entityType: t('common.subspaces'),
                count: subspaces.length,
              })}
            />
            <DialogContent>
              {state.loading && <Loading />}
              {!state.loading && subspaces.length > 0 && (
                <JourneyFilter data={subspaces} valueGetter={journeyCardValueGetter}>
                  {filteredEntities => (
                    <CardLayoutContainer>
                      {filteredEntities.map((subspace, index) => {
                        const key = subspace ? subspace.id : `__loading_${index}`;
                        return (
                          <SubspaceCard
                            key={key}
                            displayName={subspace.profile.displayName}
                            banner={subspace.profile.cardBanner}
                            tags={subspace.profile.tagset?.tags!}
                            tagline={subspace.profile.tagline!}
                            vision={subspace.context?.vision!}
                            journeyUri={subspace.profile.url}
                            locked={subspace.settings.privacy?.mode === SpacePrivacyMode.Private}
                            spaceVisibility={visibility}
                            member={
                              subspace.community?.roleSet?.myMembershipStatus === CommunityMembershipStatus.Member
                            }
                          />
                        );
                      })}
                    </CardLayoutContainer>
                  )}
                </JourneyFilter>
              )}
            </DialogContent>
          </>
        )}
      </SubspacesContainer>
    </DialogWithGrid>
  );
};

export default SubspacesListDialog;
