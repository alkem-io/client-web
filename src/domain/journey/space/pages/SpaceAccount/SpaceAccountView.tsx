import { FC, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Box, Button, CircularProgress } from '@mui/material';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { v4 as uuidv4 } from 'uuid';
import { buildOrganizationUrl, buildSettingsUrl } from '../../../../../main/routing/urlBuilders';
import PageContent from '../../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import SeeMore from '../../../../../core/ui/content/SeeMore';
import { BlockTitle, Caption } from '../../../../../core/ui/typography';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import ContributorCardHorizontal from '../../../../../core/ui/card/ContributorCardHorizontal';
import Gutters from '../../../../../core/ui/grid/Gutters';
import { AuthorizationPrivilege, BodyOfKnowledgeType } from '../../../../../core/apollo/generated/graphql-schema';
import {
  useCreateVirtualContributorOnAccountMutation,
  useDeleteSpaceMutation,
  refetchAdminSpacesListQuery,
  useSpaceHostQuery,
  useSpacePrivilegesQuery,
  useSpaceSubspacesQuery,
  useDeleteVirtualContributorOnAccountMutation,
  refetchSpaceSubspacesQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { gutters } from '../../../../../core/ui/grid/utils';
import { ROUTE_HOME } from '../../../../platform/routes/constants';
import { useSpace } from '../../SpaceContext/useSpace';
import { DeleteIcon } from '../SpaceSettings/icon/DeleteIcon';
import SpaceProfileDeleteDialog from '../SpaceSettings/SpaceProfileDeleteDialog';
import CreateVirtualContributorDialog, {
  VirtualContributorFormValues,
} from '../SpaceSettings/CreateVirtualContributorDialog';
import ContributorOnAccountCard from '../SpaceSettings/ContributorOnAccountCard';
import useNavigate from '../../../../../core/routing/useNavigate';

interface SpaceAccountPageProps {
  journeyId: string;
}

const SpaceAccountView: FC<SpaceAccountPageProps> = ({ journeyId }) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const navigate = useNavigate();

  const errorColor = '#940000';

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const openDialog = () => setOpenDeleteDialog(true);
  const closeDialog = () => setOpenDeleteDialog(false);
  const [isCreateVCDialogOpen, setIsCreateVCDialogOpen] = useState(false);
  const openCreateVCDialog = () => setIsCreateVCDialogOpen(true);
  const closeCreateVCDialog = () => setIsCreateVCDialogOpen(false);
  const [isOpenDeleteVCDialog, setIsOpenDeleteVCDialog] = useState(false);
  const openDeleteVCDialog = () => setIsOpenDeleteVCDialog(true);
  const closeDeleteVCDialog = () => setIsOpenDeleteVCDialog(false);

  const { spaceId, spaceNameId, license } = useSpace();

  const { data: hostOrganizationData, loading: hostOrganizationLoading } = useSpaceHostQuery({
    variables: { spaceNameId: journeyId },
  });
  const hostOrganization = hostOrganizationData?.space.account.host;

  const { data: spacePriviledges, loading: spacePriviledgesLoading } = useSpacePrivilegesQuery({
    variables: {
      spaceId: spaceId,
    },
    skip: !spaceId,
  });

  const [deleteSpace, { loading: deletingSpace }] = useDeleteSpaceMutation({
    refetchQueries: [refetchAdminSpacesListQuery()],
    awaitRefetchQueries: true,
    onCompleted: data => {
      notify(t('pages.admin.space.notifications.space-removed', { name: data.deleteSpace.nameID }), 'success');
      navigate(ROUTE_HOME, { replace: true });
    },
  });

  const privileges = spacePriviledges?.lookup.space?.authorization?.myPrivileges ?? [];
  const canDelete = privileges?.includes(AuthorizationPrivilege.Delete);

  const handleDelete = (id: string) => {
    deleteSpace({
      variables: {
        input: {
          ID: id,
        },
      },
    });
  };

  const [deleteVirtualContributor, { loading: deletingVirtualContributor }] =
    useDeleteVirtualContributorOnAccountMutation({
      refetchQueries: [refetchSpaceSubspacesQuery({ spaceId: spaceNameId })],
      awaitRefetchQueries: true,
    });

  const handleDeleteVC = async () => {
    await deleteVirtualContributor({
      variables: {
        virtualContributorData: {
          ID: spaceData?.space?.account?.virtualContributors[0].nameID || '',
        },
      },
    });

    notify('Virtual Contribuotr deleted successfuly!', 'success');
    closeDeleteVCDialog();
  };

  const { data: spaceData, loading: spaceDataLoading } = useSpaceSubspacesQuery({
    variables: {
      spaceId: spaceNameId,
    },
    skip: !spaceNameId,
  });

  const subspaces = useMemo(() => {
    const result =
      spaceData?.space?.subspaces.map(subspace => ({
        id: subspace.id,
        name: subspace?.profile.displayName,
      })) ?? [];

    result.push({
      id: spaceId,
      name: spaceData?.space?.profile.displayName || '',
    });

    return result;
  }, [spaceData]);

  const bokSpaceData = useMemo(
    () =>
      spaceData?.space?.subspaces
        .filter(subspace => subspace.id === spaceData?.space?.account?.virtualContributors[0]?.bodyOfKnowledgeID)
        .map(data => ({ profile: { displayName: data.profile.displayName } }))[0],
    [spaceData]
  );

  const currentVirtualContributor = useMemo(() => {
    if (spaceData?.space?.account?.id && spaceData?.space?.account?.virtualContributors) {
      return spaceData?.space?.account?.virtualContributors[0];
    }

    return null;
  }, [spaceData]);

  const [createVirtualContributorOnAccount, { loading: loadingVCCreation }] =
    useCreateVirtualContributorOnAccountMutation({
      refetchQueries: [refetchSpaceSubspacesQuery({ spaceId: spaceNameId })],
      awaitRefetchQueries: true,
    });

  const handleCreateVirtualContributor = async ({ displayName, bodyOfKnowledgeID }: VirtualContributorFormValues) => {
    const vsResponse = await createVirtualContributorOnAccount({
      variables: {
        virtualContributorData: {
          nameID: `v-c-${uuidv4()}`.slice(0, 25).toLocaleLowerCase(),
          profileData: {
            displayName,
          },
          accountID: spaceData?.space.account.id ?? '',
          bodyOfKnowledgeID,
          bodyOfKnowledgeType: BodyOfKnowledgeType.Space,
        },
      },
    });

    notify('Virtual Contributor Created Successfully!', 'success');
    closeCreateVCDialog();
    navigate(buildSettingsUrl(vsResponse.data?.createVirtualContributor.profile.url ?? ''));
  };

  const ALKEMIO_DOMAIN = 'https://alkem.io/';
  const loading = deletingSpace && spacePriviledgesLoading && hostOrganizationLoading;

  return (
    <PageContent background="transparent">
      {!loading && (
        <>
          <PageContentBlock columns={6} sx={{ gap: gutters(2) }}>
            <Gutters disablePadding>
              <BlockTitle>{t('common.url')}</BlockTitle>
              <Caption>
                {ALKEMIO_DOMAIN}
                {spaceNameId}
              </Caption>
            </Gutters>
            <Gutters disablePadding>
              <BlockTitle>{t('common.visibility')}</BlockTitle>
              <Caption>
                <Trans
                  t={t}
                  i18nKey="components.editSpaceForm.visibility"
                  values={{
                    visibility: t(`common.enums.space-visibility.${license.visibility}` as const),
                  }}
                  components={{ strong: <strong /> }}
                />
              </Caption>
            </Gutters>
            <Gutters disablePadding>
              <BlockTitle>{t('pages.admin.generic.sections.account.hostTitle')}</BlockTitle>
              <ContributorCardHorizontal
                profile={{
                  displayName: hostOrganization?.profile.displayName || '',
                  avatar: hostOrganization?.profile.avatar,
                  location: hostOrganization?.profile.location,
                  tagsets: undefined,
                }}
                url={(hostOrganization?.nameID && buildOrganizationUrl(hostOrganization?.nameID)) || ''}
                seamless
              />
            </Gutters>
            <Gutters disablePadding>
              <SeeMore
                label="pages.admin.generic.sections.account.contactsLinkText"
                to={t('pages.admin.generic.sections.account.contactsLink')}
                sx={{ textAlign: 'left' }}
              />
            </Gutters>
          </PageContentBlock>
          <PageContentBlock columns={6} sx={{ gap: gutters(2) }}>
            <Gutters disablePadding alignItems={'flex-start'}>
              <BlockTitle>{t('pages.admin.space.settings.account.vc-section-title')}</BlockTitle>
              {currentVirtualContributor && (
                <ContributorOnAccountCard
                  contributor={currentVirtualContributor}
                  space={bokSpaceData}
                  onDeleteClick={openDeleteVCDialog}
                />
              )}
              <Button
                variant="outlined"
                startIcon={<ControlPointIcon />}
                onClick={openCreateVCDialog}
                disabled={!!currentVirtualContributor || spaceDataLoading}
              >
                {t('pages.admin.space.settings.account.vc-create-button')}
              </Button>
            </Gutters>
          </PageContentBlock>
          {canDelete && (
            <PageContentBlock sx={{ borderColor: errorColor }}>
              <PageContentBlockHeader sx={{ color: errorColor }} title={t('components.deleteSpace.title')} />
              <Box display="flex" gap={1} alignItems="center" sx={{ cursor: 'pointer' }} onClick={openDialog}>
                <DeleteIcon />
                <Caption>{t('components.deleteSpace.description', { entity: t('common.space') })}</Caption>
              </Box>
            </PageContentBlock>
          )}
          {openDeleteDialog && (
            <SpaceProfileDeleteDialog
              entity={t('common.space')}
              open={openDeleteDialog}
              onClose={closeDialog}
              onDelete={() => handleDelete(journeyId)}
              submitting={deletingSpace}
            />
          )}
          <SpaceProfileDeleteDialog
            entity={t('common.virtual-contributor')}
            description="virtualContributorSpaceSettings.confirm-deletion.description"
            open={isOpenDeleteVCDialog}
            onClose={closeDeleteVCDialog}
            onDelete={handleDeleteVC}
            submitting={deletingVirtualContributor}
          />
          <CreateVirtualContributorDialog
            spaces={subspaces}
            open={isCreateVCDialogOpen}
            onClose={closeCreateVCDialog}
            onCreate={handleCreateVirtualContributor}
            submitting={loadingVCCreation || spaceDataLoading}
          />
        </>
      )}
      {loading && (
        <Box marginX="auto">
          {' '}
          <CircularProgress />{' '}
        </Box>
      )}
    </PageContent>
  );
};

export default SpaceAccountView;
