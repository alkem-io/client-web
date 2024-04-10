import React, { FC, useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import useNavigate from '../../../../../core/routing/useNavigate';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SearchableList, { SearchableListItem } from '../../../../platform/admin/components/SearchableList';
import Loading from '../../../../../core/ui/loading/Loading';
import {
  refetchAdminSpaceChallengesPageQuery,
  useAdminSpaceChallengesPageQuery,
  useCreateSubspaceMutation,
  useDeleteSpaceMutation,
  useUpdateSpaceDefaultInnovationFlowTemplateMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import { useSpace } from '../../SpaceContext/useSpace';
import { JourneyCreationDialog } from '../../../../shared/components/JorneyCreationDialog';
import { ChallengeIcon } from '../../../subspace/icon/ChallengeIcon';
import { JourneyFormValues } from '../../../../shared/components/JorneyCreationDialog/JourneyCreationForm';
import { buildJourneyAdminUrl } from '../../../../../main/routing/urlBuilders';
import { CreateChallengeForm } from '../../../subspace/forms/CreateChallengeForm';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import { BlockSectionTitle, Caption } from '../../../../../core/ui/typography';
import InnovationFlowProfileView from '../../../../collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowProfileView';
import InnovationFlowStates from '../../../../collaboration/InnovationFlow/InnovationFlowStates/InnovationFlowStates';
import { Actions } from '../../../../../core/ui/actions/Actions';
import { Cached } from '@mui/icons-material';
import SelectDefaultInnovationFlowDialog from '../../../../collaboration/InnovationFlow/InnovationFlowDialogs/SelectDefaultInnovationFlow/SelectDefaultInnovationFlowDialog';

export const ChallengeListView: FC = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { spaceNameId, spaceId } = useSpace();
  const navigate = useNavigate();
  const [journeyCreationDialogOpen, setJourneyCreationDialogOpen] = useState(false);
  const [innovationFlowDialogOpen, setInnovationFlowDialogOpen] = useState(false);

  const { data, loading } = useAdminSpaceChallengesPageQuery({
    variables: {
      spaceId: spaceNameId,
    },
  });
  const defaultInnovationFlow = data?.space.account.defaults?.innovationFlowTemplate;
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined);
  useEffect(() => {
    setSelectedState(defaultInnovationFlow?.states[0].displayName);
  }, [defaultInnovationFlow?.states?.[0]?.displayName]);

  const challengeList =
    data?.space?.subspaces?.map(c => ({
      id: c.id,
      value: c.profile.displayName,
      url: `${c.nameID}`,
    })) || [];

  const [deleteChallenge] = useDeleteSpaceMutation({
    refetchQueries: [
      refetchAdminSpaceChallengesPageQuery({
        spaceId: spaceNameId,
      }),
    ],
    awaitRefetchQueries: true,
    onCompleted: () => notify(t('pages.admin.subspace.notifications.subspace-removed'), 'success'),
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

  const [createChallenge] = useCreateSubspaceMutation({
    onCompleted: () => {
      notify(t('pages.admin.subspace.notifications.subspace-created'), 'success');
    },
    refetchQueries: [refetchAdminSpaceChallengesPageQuery({ spaceId: spaceNameId })],
    awaitRefetchQueries: true,
  });

  const handleCreate = useCallback(
    async (value: JourneyFormValues) => {
      const { data } = await createChallenge({
        variables: {
          input: {
            spaceID: spaceNameId,
            profileData: {
              displayName: value.displayName,
              description: value.background,
              tagline: value.tagline,
            },
            context: {
              vision: value.vision,
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
    [navigate, createChallenge, spaceNameId]
  );

  const [updateInnovationFlow] = useUpdateSpaceDefaultInnovationFlowTemplateMutation();
  const handleSelectInnovationFlow = async (innovationFlowTemplateId: string) => {
    await updateInnovationFlow({
      variables: {
        spaceId: spaceId,
        innovationFlowTemplateId,
      },
      refetchQueries: [
        refetchAdminSpaceChallengesPageQuery({
          spaceId: spaceNameId,
        }),
      ],
      awaitRefetchQueries: true,
    });
    setInnovationFlowDialogOpen(false);
  };

  if (loading) return <Loading text={'Loading challenges'} />;

  return (
    <>
      <PageContentBlock>
        <PageContentBlockHeader title={t('pages.admin.space.sections.subspaces.defaultSettings.title')} />
        <Caption>{t('pages.admin.space.sections.subspaces.defaultSettings.description')}</Caption>
        <PageContentBlock>
          <PageContentBlockHeader title={t('common.innovation-flow')} />
          <BlockSectionTitle>{defaultInnovationFlow?.profile.displayName}</BlockSectionTitle>
          <InnovationFlowProfileView innovationFlow={defaultInnovationFlow} />
          <InnovationFlowStates
            states={defaultInnovationFlow?.states}
            selectedState={selectedState}
            onSelectState={state => setSelectedState(state.displayName)}
          />
          <Actions justifyContent="end">
            <Button variant="outlined" startIcon={<Cached />} onClick={() => setInnovationFlowDialogOpen(true)}>
              {t('pages.admin.space.sections.subspaces.defaultSettings.defaultInnovationFlow.selectDifferentFlow')}
            </Button>
          </Actions>
        </PageContentBlock>
      </PageContentBlock>
      <PageContentBlock>
        <PageContentBlockHeader title={'Challenges'} />
        <Box display="flex" flexDirection="column">
          <Button
            startIcon={<AddOutlinedIcon />}
            variant="contained"
            onClick={() => setJourneyCreationDialogOpen(true)}
            sx={{ alignSelf: 'end', marginBottom: 2 }}
          >
            {t('buttons.create')}
          </Button>
          <SearchableList data={challengeList} onDelete={handleDelete} />
        </Box>
      </PageContentBlock>
      <SelectDefaultInnovationFlowDialog
        spaceId={spaceId}
        open={innovationFlowDialogOpen}
        defaultInnovationFlowId={defaultInnovationFlow?.id}
        onClose={() => setInnovationFlowDialogOpen(false)}
        onSelectInnovationFlow={handleSelectInnovationFlow}
      />
      <JourneyCreationDialog
        open={journeyCreationDialogOpen}
        icon={<ChallengeIcon />}
        journeyName={t('common.subspace')}
        onClose={() => setJourneyCreationDialogOpen(false)}
        OnCreate={handleCreate}
        formComponent={CreateChallengeForm}
      />
    </>
  );
};

export default ChallengeListView;
