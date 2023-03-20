import React, { FC, useCallback, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SearchableList, { SearchableListItem } from '../../components/SearchableList';
import Loading from '../../../../../common/components/core/Loading/Loading';
import {
  refetchOpportunitiesQuery,
  useCreateOpportunityMutation,
  useDeleteOpportunityMutation,
  useOpportunitiesQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import { useHub } from '../../../../challenge/hub/HubContext/useHub';
import { useChallenge } from '../../../../challenge/challenge/hooks/useChallenge';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import { JourneyCreationDialog } from '../../../../shared/components/JorneyCreationDialog';
import { CreateOpportunityForm } from '../../../../challenge/opportunity/forms/CreateOpportunityForm';
import { buildAdminOpportunityUrl } from '../../../../../common/utils/urlBuilders';
import { JourneyFormValues } from '../../../../shared/components/JorneyCreationDialog/JourneyCreationForm';
import { OpportunityIcon } from '../../../../challenge/opportunity/icon/OpportunityIcon';

export const OpportunityList: FC = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { hubNameId } = useHub();
  const { challengeId } = useChallenge();
  const { challengeNameId = '' } = useUrlParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: challengesListQuery, loading } = useOpportunitiesQuery({
    variables: { hubId: hubNameId, challengeId: challengeNameId },
  });

  const opportunityList =
    challengesListQuery?.hub?.challenge?.opportunities?.map(o => ({
      id: o.id,
      value: o.profile.displayName,
      url: `${o.nameID}`,
    })) || [];

  const [deleteOpportunity] = useDeleteOpportunityMutation({
    refetchQueries: [
      refetchOpportunitiesQuery({
        hubId: hubNameId,
        challengeId: challengeNameId,
      }),
    ],
    awaitRefetchQueries: true,
    onCompleted: () => notify(t('pages.admin.opportunity.notifications.opportunity-removed'), 'success'),
  });

  const handleDelete = (item: SearchableListItem) => {
    deleteOpportunity({
      variables: {
        input: {
          ID: item.id,
        },
      },
    });
  };

  const [createOpportunity] = useCreateOpportunityMutation({
    refetchQueries: [refetchOpportunitiesQuery({ hubId: hubNameId, challengeId: challengeNameId })],
    awaitRefetchQueries: true,
    onCompleted: () => {
      notify(t('pages.admin.opportunity.notifications.opportunity-created'), 'success');
    },
  });

  const handleCreate = useCallback(
    async (value: JourneyFormValues) => {
      const { data } = await createOpportunity({
        variables: {
          input: {
            challengeID: challengeId,
            context: {
              vision: value.vision,
            },
            profileData: {
              displayName: value.displayName,
              tagline: value.tagline,
            },
            tags: value.tags,
          },
        },
      });

      if (!data?.createOpportunity) {
        return;
      }

      navigate(buildAdminOpportunityUrl(hubNameId, challengeNameId, data?.createOpportunity.nameID));
    },
    [navigate, createOpportunity, hubNameId, challengeId, challengeNameId]
  );

  if (loading) return <Loading text={'Loading hubs'} />;

  return (
    <>
      <Box display="flex" flexDirection="column">
        <Button
          startIcon={<AddOutlinedIcon />}
          variant="contained"
          onClick={() => setOpen(true)}
          sx={{ alignSelf: 'end', marginBottom: 2 }}
        >
          {t('buttons.create')}
        </Button>
        <SearchableList data={opportunityList} onDelete={handleDelete} />
      </Box>
      <JourneyCreationDialog
        open={open}
        icon={<OpportunityIcon />}
        journeyName={t('common.opportunity')}
        onClose={() => setOpen(false)}
        OnCreate={handleCreate}
        formComponent={CreateOpportunityForm}
      />
    </>
  );
};

export default OpportunityList;
