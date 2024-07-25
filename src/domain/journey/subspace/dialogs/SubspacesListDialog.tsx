import React from 'react';
import { useTranslation } from 'react-i18next';
import { journeyCardValueGetter } from '../../common/utils/journeyCardValueGetter';
import { useSpace } from '../../space/SpaceContext/useSpace';
import SubspaceCard from '../../subspace/subspaceCard/SubspaceCard';
import SubspacesContainer from '../../space/containers/SubspacesContainer';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { DialogContent } from '@mui/material';
import { CommunityMembershipStatus, SpacePrivacyMode } from '../../../../core/apollo/generated/graphql-schema';
import { CardLayoutContainer } from '../../../../core/ui/card/cardsLayout/CardsLayout';
import JourneyFilter from '../../common/JourneyFilter/JourneyFilter';
import Loading from '../../../../core/ui/loading/Loading';

export interface SubspacesListDialogProps {
  open?: boolean;
  onClose?: () => void;
  journeyId: string;
}

const SubspacesListDialog = ({ open = false, journeyId, onClose }: SubspacesListDialogProps) => {
  const { t } = useTranslation();
  const { license } = useSpace();
  const spaceVisibility = license.visibility;

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
                            spaceVisibility={spaceVisibility}
                            member={subspace.community?.myMembershipStatus === CommunityMembershipStatus.Member}
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
