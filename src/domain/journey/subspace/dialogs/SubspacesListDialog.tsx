import React from 'react';
import { useTranslation } from 'react-i18next';
import { journeyCardTagsGetter, journeyCardValueGetter } from '../../common/utils/journeyCardValueGetter';
import { useSpace } from '../../space/SpaceContext/useSpace';
import SubspaceCard from '../../subspace/subspaceCard/SubspaceCard';
import SubspacesContainer from '../../space/containers/SubspacesContainer';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { DialogContent } from '@mui/material';
import { CommunityMembershipStatus } from '../../../../core/apollo/generated/graphql-schema';
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
      <DialogHeader onClose={onClose} title={t('callout.calloutsList.title')} />
      <DialogContent>
        <SubspacesContainer spaceId={journeyId}>
          {({ subspaces }, state) => (
            <>
              {state.loading && <Loading />}
              {!state.loading && subspaces.length > 0 && (
                <JourneyFilter
                  data={subspaces}
                  valueGetter={journeyCardValueGetter}
                  tagsGetter={journeyCardTagsGetter}
                  title={t('common.entitiesWithCount', {
                    entityType: t('common.subspaces'),
                    count: subspaces.length,
                  })}
                >
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
                            locked={!subspace.authorization?.anonymousReadAccess}
                            spaceVisibility={spaceVisibility}
                            member={subspace.community?.myMembershipStatus === CommunityMembershipStatus.Member}
                          />
                        );
                      })}
                    </CardLayoutContainer>
                  )}
                </JourneyFilter>
              )}
            </>
          )}
        </SubspacesContainer>
      </DialogContent>
    </DialogWithGrid>
  );
};

export default SubspacesListDialog;
