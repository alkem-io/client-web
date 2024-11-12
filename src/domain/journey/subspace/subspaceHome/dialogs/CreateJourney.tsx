import React, { useCallback } from 'react';
import useNavigate from '../../../../../core/routing/useNavigate';
import { useTranslation } from 'react-i18next';
import { JourneyCreationDialog } from '../../../../shared/components/JorneyCreationDialog';
import { CreateOpportunityForm } from '../../../opportunity/forms/CreateOpportunityForm';
import { JourneyFormValues } from '../../../../shared/components/JorneyCreationDialog/JourneyCreationForm';
import {
  useCreateSubspaceMutation,
  refetchSubspacesInSpaceQuery,
  refetchDashboardWithMembershipsQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';

export interface CreateJourneyProps {
  isVisible: boolean;
  onClose: () => void;
  parentSpaceId: string | undefined;
}

export const CreateJourney = ({ isVisible = false, onClose, parentSpaceId = '' }: CreateJourneyProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [createSubspace] = useCreateSubspaceMutation({
    refetchQueries: [refetchSubspacesInSpaceQuery({ spaceId: parentSpaceId }), refetchDashboardWithMembershipsQuery()],
  });

  const handleCreate = useCallback(
    async (value: JourneyFormValues) => {
      const { data } = await createSubspace({
        variables: {
          input: {
            spaceID: parentSpaceId,
            context: {
              vision: value.vision,
            },
            profileData: {
              displayName: value.displayName,
              tagline: value.tagline,
            },
            tags: value.tags,
            collaborationData: {
              addTutorialCallouts: value.addTutorialCallouts,
              addCallouts: value.addCallouts,
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
    [navigate, createSubspace, parentSpaceId]
  );

  return (
    <>
      <JourneyCreationDialog
        open={isVisible}
        journeyName={t('common.subspace')}
        onClose={onClose}
        onCreate={handleCreate}
        formComponent={CreateOpportunityForm}
      />
    </>
  );
};

export default CreateJourney;
