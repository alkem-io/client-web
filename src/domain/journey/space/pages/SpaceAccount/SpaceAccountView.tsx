import { FC, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Box, Button, CircularProgress } from '@mui/material';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import PageContent from '../../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import SeeMore from '../../../../../core/ui/content/SeeMore';
import { BlockTitle, Caption } from '../../../../../core/ui/typography';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import ContributorCardHorizontal from '../../../../../core/ui/card/ContributorCardHorizontal';
import Gutters from '../../../../../core/ui/grid/Gutters';
import { AuthorizationPrivilege, LicensePlanType } from '../../../../../core/apollo/generated/graphql-schema';
import {
  refetchAdminSpacesListQuery,
  refetchSpaceSubspacesQuery,
  useCreateVirtualContributorOnAccountMutation,
  useDeleteSpaceMutation,
  useDeleteVirtualContributorOnAccountMutation,
  useSpaceAccountQuery,
  useSpaceSubspacesQuery,
  useUpdateVirtualContributorMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { gutters } from '../../../../../core/ui/grid/utils';
import { ROUTE_HOME } from '../../../../platform/routes/constants';
import DeleteIcon from '../SpaceSettings/icon/DeleteIcon';
import SpaceProfileDeleteDialog from '../SpaceSettings/SpaceProfileDeleteDialog';
import CreateVirtualContributorDialog, {
  VirtualContributorFormValues,
} from '../SpaceSettings/CreateVirtualContributorDialog';
import ContributorOnAccountCard from '../SpaceSettings/ContributorOnAccountCard';
import useNavigate from '../../../../../core/routing/useNavigate';
import { PlanFeatures, PlanFooter, PlanName, PlanPrice } from '../../../../license/plans/ui/PlanCardsComponents';
import { getPlanTranslations } from '../../../../license/plans/utils/getPlanTranslations';
import RouterLink from '../../../../../core/ui/link/RouterLink';
import useCommunityAdmin from '../../../../community/community/CommunityAdmin/useCommunityAdmin';
import { useSpace } from '../../SpaceContext/useSpace';
import EditVirtualContributorDialog from '../SpaceSettings/EditVirtualContributorDialog';

interface SpaceAccountPageProps {
  journeyId: string;
}

const SpaceAccountView: FC<SpaceAccountPageProps> = ({ journeyId }) => {
  const { communityId } = useSpace();
  const { t } = useTranslation();
  const planTranslations = getPlanTranslations(t);
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
  const [isEditVCDialogOpen, setIsEditVCDialogOpen] = useState(false);
  const openEditVCDialog = () => setIsEditVCDialogOpen(true);
  const closeEditVCDialog = () => setIsEditVCDialogOpen(false);
  const [selectedVirtualContributorId, setSelectedVirtualContributorId] = useState<string | null>(null);

  const { permissions } = useCommunityAdmin({ communityId, spaceId: journeyId, journeyLevel: 0 });

  const { data, loading: loadingAccount } = useSpaceAccountQuery({
    variables: { spaceId: journeyId },
  });

  const space = data?.lookup.space;
  const hostOrganization = space?.provider;
  const activeSubscription = space?.account.activeSubscription;
  const canDelete = (space?.authorization?.myPrivileges ?? [])?.includes(AuthorizationPrivilege.Delete);

  const plansData = useMemo(() => {
    // Need to clone the array to be able to sort it:
    const plans = [...(data?.platform.licensing.plans ?? [])]
      .filter(plan => plan.type === LicensePlanType.SpacePlan)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(plan => ({
        ...plan,
        translation: planTranslations[plan.name],
      }));

    if (!data || !activeSubscription) {
      return undefined;
    }
    const currentPlan = plans.find(plan => plan.licenseCredential === activeSubscription.name);
    if (!currentPlan) {
      return undefined;
    }

    const currentPlanIndex = plans.findIndex(plan => plan.name === currentPlan.name);

    // The previous 2 plans in the list
    const availableDowngrades = plans.slice(Math.max(currentPlanIndex - 2, 0), currentPlanIndex);
    // The next plans 2 plans in the list, with a maximum of 3 - the number of available downgrades
    const availableUpgrades = plans
      .slice(currentPlanIndex + 1, currentPlanIndex + 3)
      .slice(0, 3 - availableDowngrades.length);

    const daysLeft =
      activeSubscription && activeSubscription.expires
        ? Math.ceil((new Date(activeSubscription.expires).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : undefined;

    return {
      plans,
      freePlan: plans.find(plan => plan.isFree),
      currentPlan,
      availableUpgrades,
      availableDowngrades,
      daysLeft,
      contactLink: data.platform.configuration.locations.support,
      switchPlanLink: data.platform.configuration.locations.switchplan,
    };
  }, [data, activeSubscription]);

  const [deleteSpace, { loading: deletingSpace }] = useDeleteSpaceMutation({
    refetchQueries: [refetchAdminSpacesListQuery()],
    awaitRefetchQueries: true,
    onCompleted: data => {
      notify(t('pages.admin.space.notifications.space-removed', { name: data.deleteSpace.nameID }), 'success');
      navigate(ROUTE_HOME, { replace: true });
      // Resetting the Apollo cache is not working well, because the page has not fully navigated
      // to the dashboard when we reset, so Apollo is trying to reload SpaceProvider
      // with the "just deleted" spaceId. With navigate(0) we just reload the page and that clears the cache.
      navigate(0);
    },
  });

  const handleDelete = (id: string) => {
    deleteSpace({
      variables: {
        input: {
          ID: id,
        },
      },
    });
  };

  const initiateDeleteVC = (id: string) => {
    setSelectedVirtualContributorId(id);
    openDeleteVCDialog();
  };

  const [deleteVirtualContributor, { loading: deletingVirtualContributor }] =
    useDeleteVirtualContributorOnAccountMutation({
      refetchQueries: [refetchSpaceSubspacesQuery({ spaceId: journeyId })],
      awaitRefetchQueries: true,
    });

  const handleDeleteVC = async () => {
    await deleteVirtualContributor({
      variables: {
        virtualContributorData: {
          ID: selectedVirtualContributorId || '',
        },
      },
    });

    notify('Virtual Contributor deleted successfuly!', 'success');
    closeDeleteVCDialog();
  };

  const { data: spaceData, loading: spaceDataLoading } = useSpaceSubspacesQuery({
    variables: {
      spaceId: journeyId,
    },
    skip: !journeyId,
  });

  const accountPrivileges = spaceData?.space?.account.authorization?.myPrivileges ?? [];
  const canCreateVirtualContributor = accountPrivileges?.includes(AuthorizationPrivilege.CreateVirtualContributor);

  const subspaces = useMemo(
    () =>
      spaceData?.space?.subspaces.map(subspace => ({
        id: subspace.id,
        name: subspace?.profile.displayName,
      })) ?? [],
    [spaceData]
  );

  const virtualContributors = spaceData?.space?.account?.virtualContributors;

  const [createVirtualContributorOnAccount, { loading: loadingVCCreation }] =
    useCreateVirtualContributorOnAccountMutation({
      refetchQueries: [refetchSpaceSubspacesQuery({ spaceId: journeyId })],
      awaitRefetchQueries: true,
    });

  const handleCreateVirtualContributor = async ({ displayName, bodyOfKnowledgeID }: VirtualContributorFormValues) => {
    const vcResponse = await createVirtualContributorOnAccount({
      variables: {
        virtualContributorData: {
          profileData: {
            displayName,
          },
          accountID: spaceData?.space.account.id ?? '',
          aiPersona: {
            description: '',
            aiPersonaService: {
              bodyOfKnowledgeID,
            },
          },
        },
      },
    });

    notify('Virtual Contributor Created Successfully!', 'success');
    closeCreateVCDialog();
    setSelectedVirtualContributorId(vcResponse.data?.createVirtualContributor.id ?? null);
    openEditVCDialog();
  };

  const [updateContributorMutation] = useUpdateVirtualContributorMutation();

  const handleEditVirtualContributor = async virtualContributor => {
    await updateContributorMutation({
      variables: {
        virtualContributorData: {
          ID: virtualContributor.ID,
          profileData: virtualContributor.profileData,
        },
      },
    });
    notify('Virtual Contributor Updated Successfully!', 'success');
    closeEditVCDialog();
  };

  const loading = loadingAccount && deletingSpace;
  const noSubspaces = subspaces?.length < 1;
  const hasVirtualContributors = virtualContributors && virtualContributors.length > 0;
  const isPlatformAdmin = accountPrivileges?.includes(AuthorizationPrivilege.PlatformAdmin);
  const disabledVirtualCreation = (hasVirtualContributors && !isPlatformAdmin) || spaceDataLoading || noSubspaces;

  const selectedVirtualContributor = virtualContributors?.find(vc => vc.id === selectedVirtualContributorId);

  return (
    <PageContent background="transparent">
      {!loading && space && hostOrganization && plansData && (
        <>
          <PageContentBlock columns={5} sx={{ gap: gutters(2) }}>
            <Gutters disablePadding>
              <BlockTitle>{t('common.url')}</BlockTitle>
              <Caption>{space.profile.url}</Caption>
            </Gutters>
            <Gutters disablePadding>
              <BlockTitle>{t('common.visibility')}</BlockTitle>
              <Caption>
                {space && (
                  <Trans
                    t={t}
                    i18nKey="components.editSpaceForm.visibility"
                    values={{
                      visibility: t(`common.enums.space-visibility.${space.visibility}` as const),
                    }}
                    components={{ strong: <strong /> }}
                  />
                )}
              </Caption>
            </Gutters>
            <Gutters disablePadding>
              <BlockTitle>{t('pages.admin.generic.sections.account.hostTitle')}</BlockTitle>
              <ContributorCardHorizontal
                profile={{
                  displayName: hostOrganization.profile.displayName,
                  avatar: hostOrganization.profile.avatar,
                  location: hostOrganization.profile.location,
                  tagsets: undefined,
                  url: hostOrganization.profile.url,
                }}
                seamless
              />
            </Gutters>
            <Gutters disablePadding>
              <SeeMore
                label="pages.admin.generic.sections.account.contactsLink"
                to={plansData.contactLink}
                sx={{ textAlign: 'left' }}
              />
            </Gutters>
          </PageContentBlock>
          <PageContentBlock columns={7} sx={{ gap: gutters(2) }}>
            <Gutters disablePadding>
              <BlockTitle>{t('common.license')}</BlockTitle>
              <Gutters row disablePadding>
                <Box width="50%">
                  <PageContentBlock fullHeight sx={{ borderColor: theme => theme.palette.primary.main }}>
                    <Caption textAlign="center">{t('pages.admin.generic.sections.account.yourLicense')}</Caption>
                    {plansData.currentPlan && (
                      <>
                        <PlanName>{plansData.currentPlan.translation.displayName}</PlanName>
                        <PlanPrice plan={plansData.currentPlan} />
                        <PlanFeatures planTranslation={plansData.currentPlan.translation} listItemComponent={Caption} />
                        <PlanFooter>
                          <BlockTitle>
                            {t('pages.admin.generic.sections.account.freeTrialNotice.title', {
                              daysLeft: plansData.daysLeft,
                            })}
                          </BlockTitle>
                          <Caption
                            component={RouterLink}
                            to={plansData.switchPlanLink}
                            textAlign="center"
                            sx={{
                              color: theme => theme.palette.primary.contrastText,
                              '&:hover': { color: theme => theme.palette.primary.contrastText },
                            }}
                          >
                            {t('pages.admin.generic.sections.account.freeTrialNotice.description', {
                              planName: plansData.currentPlan.translation.displayName,
                            })}
                          </Caption>
                        </PlanFooter>
                      </>
                    )}
                  </PageContentBlock>
                </Box>
                <Gutters disablePadding width="50%">
                  {plansData.availableUpgrades.map(plan => (
                    <PageContentBlock key={plan.name}>
                      <Caption component={RouterLink} to={plansData.switchPlanLink} textAlign="center">
                        {t('pages.admin.generic.sections.account.upgradeTo')}
                        <PlanName inline>{plan.translation.displayName}</PlanName>
                      </Caption>
                      <PlanFeatures planTranslation={plan.translation} listItemComponent={Caption} />
                    </PageContentBlock>
                  ))}
                  {plansData.availableDowngrades.map(plan => (
                    <PageContentBlock key={plan.name}>
                      <Caption component={RouterLink} to={plansData.switchPlanLink} textAlign="center">
                        {plan.isFree ? (
                          t('pages.admin.generic.sections.account.downgradeTo', {
                            planName: plan.translation.displayName,
                          })
                        ) : (
                          <>
                            {t('pages.admin.generic.sections.account.downgradeTo')}
                            <PlanName inline>{plan.translation.displayName}</PlanName>
                          </>
                        )}
                      </Caption>
                      <PlanFeatures planTranslation={plan.translation} listItemComponent={Caption} />
                    </PageContentBlock>
                  ))}
                </Gutters>
              </Gutters>
              {plansData.freePlan && // if there is a free plan
                plansData.availableDowngrades.length > 0 && // and we have printed some downgrades
                !plansData.availableDowngrades.some(plan => plan.isFree) && ( // but the free plan was not one of them
                  <PageContentBlock>
                    <Caption textAlign="center">
                      {t('pages.admin.generic.sections.account.downgradeTo', {
                        planName: plansData.freePlan.translation.displayName,
                      })}
                    </Caption>
                    <PlanFeatures planTranslation={plansData.freePlan.translation} listItemComponent={Caption} />
                  </PageContentBlock>
                )}
            </Gutters>
          </PageContentBlock>
          {permissions.virtualContributorsEnabled && (
            <PageContentBlock columns={5} sx={{ gap: gutters(2) }}>
              <Gutters disablePadding alignItems={'flex-start'}>
                {hasVirtualContributors && (
                  <BlockTitle>{t('pages.admin.space.settings.account.vc-section-title')}</BlockTitle>
                )}
                {hasVirtualContributors &&
                  virtualContributors?.map(vc => (
                    <ContributorOnAccountCard
                      key={vc.id}
                      contributor={vc}
                      // space={getBoKSpaceData(vc.bodyOfKnowledgeID ?? '')}
                      hasDelete={canCreateVirtualContributor}
                      onDeleteClick={() => initiateDeleteVC(vc.id)}
                    />
                  ))}
                {canCreateVirtualContributor && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<ControlPointIcon />}
                      onClick={openCreateVCDialog}
                      disabled={disabledVirtualCreation}
                    >
                      {t('pages.admin.space.settings.account.vc-create-button')}
                    </Button>
                    {noSubspaces && <Caption>{t('virtualContributorSpaceSettings.noSubspacesInfo')}</Caption>}
                  </>
                )}
              </Gutters>
            </PageContentBlock>
          )}
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
            description="virtualContributorSpaceSettings.confirmDeletion.description"
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
          {selectedVirtualContributor && (
            <EditVirtualContributorDialog
              virtualContributor={selectedVirtualContributor}
              // bok={getBoKProfile(selectedVirtualContributor.bodyOfKnowledgeID ?? '')}
              open={isEditVCDialogOpen}
              onClose={closeEditVCDialog}
              onSave={handleEditVirtualContributor}
              submitting={false}
            />
          )}
        </>
      )}
      {loading && (
        <Box marginX="auto">
          <CircularProgress />
        </Box>
      )}
    </PageContent>
  );
};

export default SpaceAccountView;
