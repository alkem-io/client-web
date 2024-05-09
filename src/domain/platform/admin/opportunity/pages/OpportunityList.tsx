import React, { FC, useCallback, useState } from 'react';

import useNavigate from '../../../../../core/routing/useNavigate';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SearchableList, { SearchableListItem } from '../../components/SearchableList';
import Loading from '../../../../../core/ui/loading/Loading';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import { useSpace } from '../../../../journey/space/SpaceContext/useSpace';
import { useSubSpace } from '../../../../journey/subspace/hooks/useChallenge';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import { JourneyCreationDialog } from '../../../../shared/components/JorneyCreationDialog';
import { CreateOpportunityForm } from '../../../../journey/opportunity/forms/CreateOpportunityForm';
import { buildJourneyAdminUrl } from '../../../../../main/routing/urlBuilders';
import { JourneyFormValues } from '../../../../shared/components/JorneyCreationDialog/JourneyCreationForm';
import { OpportunityIcon } from '../../../../journey/opportunity/icon/OpportunityIcon';
import {
  refetchSubspacesInSpaceQuery,
  useCreateSubspaceMutation,
  useDeleteSpaceMutation,
  useSubspacesInSpaceQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';

export const OpportunityList: FC = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { spaceNameId } = useSpace();
  const { subspaceId } = useSubSpace();
  const { challengeNameId = '' } = useUrlParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: subspacesListQuery, loading } = useSubspacesInSpaceQuery({
    variables: { spaceId: subspaceId },
    skip: !subspaceId,
  });

  const opportunityList =
    subspacesListQuery?.space?.subspaces?.map(o => ({
      id: o.id,
      value: o.profile.displayName,
      url: buildJourneyAdminUrl(o.profile.url),
    })) || [];

  const [deleteOpportunity] = useDeleteSpaceMutation({
    refetchQueries: [
      refetchSubspacesInSpaceQuery({
        spaceId: subspaceId,
      }),
    ],
    awaitRefetchQueries: true,
    onCompleted: () => notify(t('pages.admin.subsubspace.notifications.subsubspace-removed'), 'success'),
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

  const [createSubspace] = useCreateSubspaceMutation({
    refetchQueries: [refetchSubspacesInSpaceQuery({ spaceId: subspaceId })],
    awaitRefetchQueries: true,
    onCompleted: () => {
      notify(t('pages.admin.subsubspace.notifications.subsubspace-created'), 'success');
    },
  });

  const handleCreate = useCallback(
    async (value: JourneyFormValues) => {
      const { data } = await createSubspace({
        variables: {
          input: {
            spaceID: subspaceId,
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
        navigate(buildJourneyAdminUrl(data?.createSubspace.profile.url));
      }
    },
    [navigate, createSubspace, spaceNameId, subspaceId, challengeNameId]
  );

  if (loading) return <Loading text={'Loading spaces'} />;

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
        journeyName={t('common.subspace')}
        onClose={() => setOpen(false)}
        onCreate={handleCreate}
        formComponent={CreateOpportunityForm}
      />
    </>
  );
};

export default OpportunityList;
