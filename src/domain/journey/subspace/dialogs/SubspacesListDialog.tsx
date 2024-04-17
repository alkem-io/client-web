import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useNavigate from '../../../../core/routing/useNavigate';
import { journeyCardTagsGetter, journeyCardValueGetter } from '../../common/utils/journeyCardValueGetter';
import { JourneyCreationDialog } from '../../../shared/components/JorneyCreationDialog';
import { JourneyFormValues } from '../../../shared/components/JorneyCreationDialog/JourneyCreationForm';
import { useSubspaceCreation } from '../../../shared/utils/useJourneyCreation/useJourneyCreation';
import ChildJourneyView from '../../common/tabs/Subentities/ChildJourneyView';
import { useSpace } from '../../space/SpaceContext/useSpace';
import { ChallengeIcon } from '../../subspace/icon/ChallengeIcon';
import ChallengeCard from '../../subspace/subspaceCard/SubspaceCard';
import { CreateChallengeForm } from '../../subspace/forms/CreateChallengeForm';
import SpaceChallengesContainer from '../../space/containers/SpaceChallengesContainer';
import { Dialog, DialogContent } from '@mui/material';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { CommunityMembershipStatus } from '../../../../core/apollo/generated/graphql-schema';

export interface SubspacesListDialogProps {
  open?: boolean;
  onClose?: () => void;
  journeyId: string;
}

const SubspacesListDialog = ({ open = false, journeyId, onClose }: SubspacesListDialogProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { permissions, license } = useSpace();
  const spaceVisibility = license.visibility;

  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  const { createSubspace } = useSubspaceCreation();

  const handleCreate = useCallback(
    async (value: JourneyFormValues) => {
      const result = await createSubspace({
        spaceID: journeyId,
        displayName: value.displayName,
        tagline: value.tagline,
        background: value.background ?? '',
        vision: value.vision,
        tags: value.tags,
        addDefaultCallouts: value.addDefaultCallouts,
      });

      if (!result) {
        return;
      }

      navigate(result.profile.url);
    },
    [navigate, createSubspace, journeyId]
  );

  return (
    <Dialog open={open}>
      <DialogHeader onClose={onClose} title={t('callout.calloutsList.title')} />
      <DialogContent>
        <SpaceChallengesContainer spaceId={journeyId}>
          {({ ...entities }, state) => (
            <ChildJourneyView
              childEntities={entities.subspaces}
              childEntitiesIcon={<ChallengeIcon />}
              childEntityReadAccess={permissions.canReadChallenges}
              childEntityValueGetter={journeyCardValueGetter}
              childEntityTagsGetter={journeyCardTagsGetter}
              journeyTypeName="space"
              state={{ loading: state.loading, error: state.error }}
              renderChildEntityCard={challenge => (
                <ChallengeCard
                  displayName={challenge.profile.displayName}
                  banner={challenge.profile.cardBanner}
                  tags={challenge.profile.tagset?.tags!}
                  tagline={challenge.profile.tagline!}
                  vision={challenge.context?.vision!}
                  journeyUri={challenge.profile.url}
                  locked={!challenge.authorization?.anonymousReadAccess}
                  spaceVisibility={spaceVisibility}
                  member={challenge.community?.myMembershipStatus === CommunityMembershipStatus.Member}
                />
              )}
              onClickCreate={() => setCreateDialogOpen(true)}
              childEntityCreateAccess={permissions.canCreateChallenges}
              childEntityOnCreate={() => setCreateDialogOpen(true)}
              createSubentityDialog={
                <JourneyCreationDialog
                  open={isCreateDialogOpen}
                  icon={<ChallengeIcon />}
                  journeyName={t('common.subspace')}
                  onClose={() => setCreateDialogOpen(false)}
                  OnCreate={handleCreate}
                  formComponent={CreateChallengeForm}
                />
              }
            />
          )}
        </SpaceChallengesContainer>
      </DialogContent>
    </Dialog>
  );
};

export default SubspacesListDialog;
