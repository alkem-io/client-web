import { useCallback } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import { useTranslation } from 'react-i18next';
import { SubspaceCreationDialog } from '@/domain/space/components/subspaces/SubspaceCreationDialog/SubspaceCreationDialog';
import { SpaceFormValues } from '@/domain/space/components/subspaces/SubspaceCreationDialog/SubspaceCreationForm';
import { refetchSubspacesInSpaceQuery } from '@/core/apollo/generated/apollo-hooks';
import { CreateSubspaceForm } from '../CreateSubspaceForm';
import { useSubspaceCreation } from '@/domain/space/hooks/useSubspaceCreation/useSubspaceCreation';
import SpaceL1Icon2 from '../../../icons/SpaceL1Icon2';

export interface CreateSubspaceProps {
  isVisible: boolean;
  onClose: () => void;
  parentSpaceId: string | undefined;
}

export const CreateSubspace = ({ isVisible = false, onClose, parentSpaceId = '' }: CreateSubspaceProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { createSubspace } = useSubspaceCreation({
    refetchQueries: [refetchSubspacesInSpaceQuery({ spaceId: parentSpaceId })],
  });

  const handleCreate = useCallback(
    async (value: SpaceFormValues) => {
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
        spaceTemplateId: value.spaceTemplateId,
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
      spaceDisplayName={t('common.subspace')}
      onClose={onClose}
      onCreate={handleCreate}
      formComponent={CreateSubspaceForm}
    />
  );
};

export default CreateSubspace;
