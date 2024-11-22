import { useCallback } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import { useTranslation } from 'react-i18next';
import { JourneyCreationDialog } from '@/domain/shared/components/JorneyCreationDialog/JourneyCreationDialog';
import { CreateOpportunityForm } from '@/domain/journey/opportunity/forms/CreateOpportunityForm';
import { JourneyFormValues } from '@/domain/shared/components/JorneyCreationDialog/JourneyCreationForm';
import {
  useCreateSubspaceMutation,
  refetchSubspacesInSpaceQuery,
  refetchDashboardWithMembershipsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { Box } from '@mui/material';

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
              collaborationTemplateID: value.collaborationTemplateId,
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
    <Box border="1px solid red">
      CreateJourney - Where is this used? //!!
      <JourneyCreationDialog
        open={isVisible}
        journeyName={t('common.subspace')}
        onClose={onClose}
        onCreate={handleCreate}
        formComponent={CreateOpportunityForm}
      />
    </Box>
  );
};

export default CreateJourney;
