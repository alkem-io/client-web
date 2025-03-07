import { useCallback } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import { useTranslation } from 'react-i18next';
import { JourneyCreationDialog } from '@/domain/shared/components/JourneyCreationDialog/JourneyCreationDialog';
import { JourneyFormValues } from '@/domain/shared/components/JourneyCreationDialog/JourneyCreationForm';
import {
  refetchSubspacesInSpaceQuery,
  refetchDashboardWithMembershipsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { CreateSubspaceForm } from '../../forms/CreateSubspaceForm';
import { useSubspaceCreation } from '@/domain/shared/utils/useSubspaceCreation/useSubspaceCreation';
import SubspaceIcon2 from '../../icon/SubspaceIcon2';

export interface CreateJourneyProps {
  isVisible: boolean;
  onClose: () => void;
  parentSpaceId: string | undefined;
}

export const CreateJourney = ({ isVisible = false, onClose, parentSpaceId = '' }: CreateJourneyProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { createSubspace } = useSubspaceCreation({
    refetchQueries: [refetchSubspacesInSpaceQuery({ spaceId: parentSpaceId }), refetchDashboardWithMembershipsQuery()],
  });

  const handleCreate = useCallback(
    async (value: JourneyFormValues) => {
      const result = await createSubspace({
        spaceID: parentSpaceId,
        about: {
          profile: {
            displayName: value.displayName,
            tagline: value.tagline,
            description: value.description ?? '',
            visuals: value.visuals,
            tags: value.tags,
          },
          why: value.why,
        },
        addTutorialCallouts: value.addTutorialCallouts,
        collaborationTemplateId: value.collaborationTemplateId,
      });

      if (!result) {
        return;
      }
      navigate(result.about?.profile?.url!);
      onClose();
    },
    [navigate, createSubspace, parentSpaceId]
  );

  return (
    <JourneyCreationDialog
      icon={<SubspaceIcon2 fill="primary" />}
      open={isVisible}
      journeyName={t('common.subspace')}
      onClose={onClose}
      onCreate={handleCreate}
      formComponent={CreateSubspaceForm}
    />
  );
};

export default CreateJourney;
