import { useCallback } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import { useTranslation } from 'react-i18next';
import { SpaceCreationDialog } from '../common/SpaceCreationDialog';
import { SpaceFormValues } from '../common/SpaceCreationDialog.models';
import { refetchSubspacesInSpaceQuery } from '@/core/apollo/generated/apollo-hooks';
import { CreateSubspaceForm } from './CreateSubspaceForm';
import { useSubspaceCreation } from '@/domain/space/components/CreateSpace/hooks/useSubspaceCreation/useSubspaceCreation';
import SpaceL1Icon2 from '../../../icons/SpaceL1Icon2';
import useEnsurePresence from '@/core/utils/ensurePresence';
import { Identifiable } from '@/core/utils/Identifiable';

type SubspaceCreatedResult = Identifiable & {
  about: {
    profile: {
      url: string;
    };
  };
};

export interface CreateSubspaceProps {
  open?: boolean;
  onClose?: () => void;
  parentSpaceId: string | undefined;
  onSubspaceCreated?: (subspace: SubspaceCreatedResult) => void;
}

export const CreateSubspace = ({ open = false, onClose, parentSpaceId, onSubspaceCreated }: CreateSubspaceProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const ensurePresence = useEnsurePresence();

  const { createSubspace } = useSubspaceCreation({
    refetchQueries: [refetchSubspacesInSpaceQuery({ spaceId: parentSpaceId! })],
    awaitRefetchQueries: true,
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
            description: value.description,
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
      onClose?.();
      if (onSubspaceCreated && result) {
        onSubspaceCreated(result);
      } else {
        navigate(spaceUrl);
      }
    },
    [navigate, createSubspace, parentSpaceId, onSubspaceCreated]
  );

  return (
    <SpaceCreationDialog
      icon={<SpaceL1Icon2 fill="primary" />}
      open={open}
      entityName={t('common.subspace')}
      onClose={onClose}
      onCreate={handleCreate}
      formComponent={CreateSubspaceForm}
    />
  );
};

export default CreateSubspace;
