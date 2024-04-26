import React, { useCallback } from 'react';
import useNavigate from '../../../../../core/routing/useNavigate';
import { useTranslation } from 'react-i18next';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import { JourneyCreationDialog } from '../../../../shared/components/JorneyCreationDialog';
import { CreateOpportunityForm } from '../../../opportunity/forms/CreateOpportunityForm';
import { JourneyFormValues } from '../../../../shared/components/JorneyCreationDialog/JourneyCreationForm';
import {
  useCreateSubspaceMutation,
  refetchSubspacesInSpaceQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';

export interface CreateJourneyProps {
  isVisible: boolean;
  onClose: () => void;
  parentSpaceId?: string;
}

export const CreateJourney = ({ isVisible = false, onClose, parentSpaceId = '' }: CreateJourneyProps) => {
  const { t } = useTranslation();
  const { spaceNameId = '' } = useUrlParams();
  const navigate = useNavigate();

  const [createSubspace] = useCreateSubspaceMutation({
    refetchQueries: [refetchSubspacesInSpaceQuery({ spaceId: parentSpaceId })],
  });

  const handleCreate = useCallback(
    async (value: JourneyFormValues) => {
      const { data } = await createSubspace({
        variables: {
          input: {
            spaceID: parentSpaceId || spaceNameId,
            context: {
              vision: value.vision,
            },
            profileData: {
              displayName: value.displayName,
              tagline: value.tagline,
            },
            tags: value.tags,
            collaborationData: {
              addDefaultCallouts: value.addDefaultCallouts,
            },
          },
        },
      });

      if (!data?.createSubspace) {
        return;
      }
      if (data?.createSubspace.profile.url) {
        navigate(data?.createSubspace.profile.url);
        onClose();
      }
    },
    [navigate, createSubspace, parentSpaceId, spaceNameId]
  );

  return (
    <>
      <JourneyCreationDialog
        open={isVisible}
        journeyName={t('common.subspace')}
        onClose={onClose}
        OnCreate={handleCreate}
        formComponent={CreateOpportunityForm}
      />
    </>
  );
};

export default CreateJourney;
