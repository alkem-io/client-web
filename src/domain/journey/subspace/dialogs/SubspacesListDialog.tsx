import { CommunityMembershipStatus, SpacePrivacyMode } from '@/core/apollo/generated/graphql-schema';
import { CardLayoutContainer } from '@/core/ui/card/cardsLayout/CardsLayout';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import Loading from '@/core/ui/loading/Loading';
import JourneyFilter from '@/domain/journey/common/JourneyFilter/JourneyFilter';
import { journeyCardValueGetter } from '@/domain/journey/common/utils/journeyCardValueGetter';
import { useSpace } from '@/domain/journey/space/SpaceContext/useSpace';
import SubspacesContainer from '@/domain/journey/space/containers/SubspacesContainer';
import SubspaceCard from '@/domain/journey/subspace/subspaceCard/SubspaceCard';
import { DialogContent } from '@mui/material';
import { useTranslation } from 'react-i18next';

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
                            displayName={subspace.about.profile.displayName}
                            banner={subspace.about.profile.cardBanner}
                            tags={subspace.about.profile.tagset?.tags!}
                            tagline={subspace.about.profile.tagline!}
                            vision={subspace.about.why!}
                            journeyUri={subspace.about.profile.url}
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
