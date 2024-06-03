import { FC, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Box, Button, CircularProgress } from '@mui/material';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { v4 as uuidv4 } from 'uuid';
import { buildSettingsUrl } from '../../../../../main/routing/urlBuilders';
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
  useSpaceAccountQuery,
  useSpaceSubspacesQuery,
  useDeleteVirtualContributorOnAccountMutation,
  refetchSpaceSubspacesQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { gutters } from '../../../../../core/ui/grid/utils';
import { ROUTE_HOME } from '../../../../platform/routes/constants';
import { DeleteIcon } from '../SpaceSettings/icon/DeleteIcon';
import SpaceProfileDeleteDialog from '../SpaceSettings/SpaceProfileDeleteDialog';
import CreateVirtualContributorDialog, {
  VirtualContributorFormValues,
} from '../SpaceSettings/CreateVirtualContributorDialog';
import ContributorOnAccountCard from '../SpaceSettings/ContributorOnAccountCard';
import useNavigate from '../../../../../core/routing/useNavigate';
import { PlanFeatures, PlanFooter, PlanName, PlanPrice } from '../../../../license/plans/ui/PlanCardsComponents';
import { getPlanTranslations } from '../../../../license/plans/utils/getPlanTranslations';
import RouterLink from '../../../../../core/ui/link/RouterLink';

interface SpaceAccountPageProps {
  journeyId: string;
}

const SpaceAccountView: FC<SpaceAccountPageProps> = ({ journeyId }) => {
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

  const { data, loading: loadingAccount } = useSpaceAccountQuery({
    variables: { spaceId: journeyId },
  });

  const space = data?.lookup.space;
  const hostOrganization = space?.account.host;
  const activeSubscription = space?.account.activeSubscription;
  const canDelete = (space?.authorization?.myPrivileges ?? [])?.includes(AuthorizationPrivilege.Delete);

  const plansData = useMemo(() => {
    // Need to clone the array to be able to sort it:
    const plans = [...(data?.platform.licensing.plans ?? [])]
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

  const [deleteVirtualContributor, { loading: deletingVirtualContributor }] =
    useDeleteVirtualContributorOnAccountMutation({
      refetchQueries: [refetchSpaceSubspacesQuery({ spaceId: journeyId })],
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
      spaceId: journeyId,
    },
    skip: !journeyId,
  });

  const accountPrivileges = spaceData?.space?.account.authorization?.myPrivileges ?? [];
  const canCreateVirtualContributor = accountPrivileges?.includes(AuthorizationPrivilege.CreateVirtualContributor);

  const subspaces = useMemo(() => {
    const result =
      spaceData?.space?.subspaces.map(subspace => ({
        id: subspace.id,
        name: subspace?.profile.displayName,
      })) ?? [];

    result.push({
      id: journeyId,
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
      refetchQueries: [refetchSpaceSubspacesQuery({ spaceId: journeyId })],
      awaitRefetchQueries: true,
    });

  const handleCreateVirtualContributor = async ({ displayName, bodyOfKnowledgeID }: VirtualContributorFormValues) => {
    const vsResponse = await createVirtualContributorOnAccount({
      variables: {
        virtualContributorData: {
          // todo: guarantee uniqueness but use createNameId(displayName)
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

  const loading = loadingAccount && deletingSpace;

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
                      visibility: t(`common.enums.space-visibility.${space.account.license.visibility}` as const),
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
                }}
                url={hostOrganization.profile.url}
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
          <PageContentBlock columns={5} sx={{ gap: gutters(2) }}>
            <Gutters disablePadding alignItems={'flex-start'}>
              <BlockTitle>{t('pages.admin.space.settings.account.vc-section-title')}</BlockTitle>
              {currentVirtualContributor && (
                <ContributorOnAccountCard
                  contributor={currentVirtualContributor}
                  space={bokSpaceData}
                  hasDelete={canCreateVirtualContributor}
                  onDeleteClick={openDeleteVCDialog}
                />
              )}
              {canCreateVirtualContributor && (
                <Button
                  variant="outlined"
                  startIcon={<ControlPointIcon />}
                  onClick={openCreateVCDialog}
                  disabled={!!currentVirtualContributor || spaceDataLoading}
                >
                  {t('pages.admin.space.settings.account.vc-create-button')}
                </Button>
              )}
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
          <CircularProgress />
        </Box>
      )}
    </PageContent>
  );
};

export default SpaceAccountView;
