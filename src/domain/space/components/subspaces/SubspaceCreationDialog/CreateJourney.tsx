import { useCallback } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import { useTranslation } from 'react-i18next';
import { SubspaceCreationDialog } from '@/domain/space/components/subspaces/SubspaceCreationDialog/SubspaceCreationDialog';
import { JourneyFormValues } from '@/domain/space/components/subspaces/SubspaceCreationDialog/SubspaceCreationForm';
import { refetchSubspacesInSpaceQuery } from '@/core/apollo/generated/apollo-hooks';
import { CreateSubspaceForm } from '../CreateSubspaceForm';
import { useSubspaceCreation } from '@/domain/shared/utils/useSubspaceCreation/useSubspaceCreation';
import SpaceL1Icon2 from '../../../../../_deprecated/SpaceL1Icon2';

export interface CreateJourneyProps {
  isVisible: boolean;
  onClose: () => void;
  parentSpaceId: string | undefined;
}

export const CreateJourney = ({ isVisible = false, onClose, parentSpaceId = '' }: CreateJourneyProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { createSubspace } = useSubspaceCreation({
    refetchQueries: [refetchSubspacesInSpaceQuery({ spaceId: parentSpaceId })],
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
    <SubspaceCreationDialog
      icon={<SpaceL1Icon2 fill="primary" />}
      open={isVisible}
      journeyName={t('common.subspace')}
      onClose={onClose}
      onCreate={handleCreate}
      formComponent={CreateSubspaceForm}
    />
  );
};

export default CreateJourney;
