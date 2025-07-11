import { useCallback } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import { useTranslation } from 'react-i18next';
import { SubspaceCreationDialog } from '@/domain/space/components/CreateSpace/SubspaceCreationDialog/SubspaceCreationDialog';
import { SpaceFormValues } from '@/domain/space/components/CreateSpace/SubspaceCreationDialog/SubspaceCreationForm';
import { refetchSubspacesInSpaceQuery } from '@/core/apollo/generated/apollo-hooks';
import { CreateSubspaceForm } from './CreateSubspaceForm';
import { useSubspaceCreation } from '@/domain/space/components/CreateSpace/hooks/useSubspaceCreation/useSubspaceCreation';
import SpaceL1Icon2 from '../../../icons/SpaceL1Icon2';
import useEnsurePresence from '@/core/utils/ensurePresence';

export interface CreateSubspaceProps {
  open?: boolean;
  onClose?: () => void;
  parentSpaceId: string | undefined;
}

export const CreateSubspace = ({ open = false, onClose, parentSpaceId }: CreateSubspaceProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const ensurePresence = useEnsurePresence();

  const { createSubspace } = useSubspaceCreation({
    refetchQueries: [refetchSubspacesInSpaceQuery({ spaceId: parentSpaceId! })],
  });

  const handleCreate = useCallback(
    async (value: SpaceFormValues) => {
      const spaceId = ensurePresence(parentSpaceId);

      const result = await createSubspace({
        spaceID: spaceId,
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
        addCallouts: value.addCallouts,
        spaceTemplateId: value.spaceTemplateId,
      });

      const spaceUrl = ensurePresence(result?.about?.profile?.url, 'Space URL');
      navigate(spaceUrl);
      onClose?.();
    },
    [navigate, createSubspace, parentSpaceId]
  );

  return (
    <SubspaceCreationDialog
      icon={<SpaceL1Icon2 fill="primary" />}
      open={open}
      spaceDisplayName={t('common.subspace')}
      onClose={onClose}
      onCreate={handleCreate}
      formComponent={CreateSubspaceForm}
    />
  );
};

export default CreateSubspace;
