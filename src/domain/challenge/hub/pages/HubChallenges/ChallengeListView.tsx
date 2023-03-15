import React, { FC, useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SearchableList, { SearchableListItem } from '../../../../platform/admin/components/SearchableList';
import Loading from '../../../../../common/components/core/Loading/Loading';
import {
  refetchChallengesWithCommunityQuery,
  useChallengesWithCommunityQuery,
  useCreateChallengeMutation,
  useDeleteChallengeMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import { useHub } from '../../HubContext/useHub';
import { JourneyCreationDialog } from '../../../../shared/components/JorneyCreationDialog';
import { ChallengeIcon } from '../../../challenge/icon/ChallengeIcon';
import { JourneyFormValues } from '../../../../shared/components/JorneyCreationDialog/JourneyCreationForm';
import { buildAdminChallengeUrl } from '../../../../../common/utils/urlBuilders';
import { CreateChallengeForm } from '../../../challenge/forms/CreateChallengeForm';

export const ChallengeListView: FC = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { hubNameId } = useHub();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: challengesListQuery, loading } = useChallengesWithCommunityQuery({
    variables: {
      hubId: hubNameId,
    },
  });

  const challengeList =
    challengesListQuery?.hub?.challenges?.map(c => ({
      id: c.id,
      value: c.profile.displayName,
      url: `${c.nameID}`,
    })) || [];

  const [deleteChallenge] = useDeleteChallengeMutation({
    refetchQueries: [
      refetchChallengesWithCommunityQuery({
        hubId: hubNameId,
      }),
    ],
    awaitRefetchQueries: true,
    onCompleted: () => notify(t('pages.admin.challenge.notifications.challenge-removed'), 'success'),
  });

  const handleDelete = (item: SearchableListItem) => {
    deleteChallenge({
      variables: {
        input: {
          ID: item.id,
        },
      },
    });
  };

  const [createChallenge] = useCreateChallengeMutation({
    onCompleted: () => {
      notify(t('pages.admin.challenge.notifications.challenge-created'), 'success');
    },
    refetchQueries: [refetchChallengesWithCommunityQuery({ hubId: hubNameId })],
    awaitRefetchQueries: true,
  });

  const handleCreate = useCallback(
    async (value: JourneyFormValues) => {
      const { data } = await createChallenge({
        variables: {
          input: {
            hubID: hubNameId,
            profileData: {
              displayName: value.displayName,
              description: value.background,
              tagline: value.tagline,
            },
            context: {
              vision: value.vision,
            },
            tags: value.tags,
          },
        },
      });

      if (!data?.createChallenge) {
        return;
      }

      navigate(buildAdminChallengeUrl(hubNameId, data?.createChallenge.nameID));
    },
    [navigate, createChallenge, hubNameId]
  );

  if (loading) return <Loading text={'Loading challenges'} />;

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
        <SearchableList data={challengeList} onDelete={handleDelete} />
      </Box>
      <JourneyCreationDialog
        open={open}
        icon={<ChallengeIcon />}
        journeyName={t('common.challenge')}
        onClose={() => setOpen(false)}
        OnCreate={handleCreate}
        formComponent={CreateChallengeForm}
      />
    </>
  );
};

export default ChallengeListView;
