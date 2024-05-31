import { FC, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import PageContent from '../../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import SeeMore from '../../../../../core/ui/content/SeeMore';
import { BlockTitle, Caption } from '../../../../../core/ui/typography';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import ContributorCardHorizontal from '../../../../../core/ui/card/ContributorCardHorizontal';
import Gutters from '../../../../../core/ui/grid/Gutters';
import { AuthorizationPrivilege } from '../../../../../core/apollo/generated/graphql-schema';
import {
  refetchAdminSpacesListQuery,
  useDeleteSpaceMutation,
  useSpaceAccountQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { gutters } from '../../../../../core/ui/grid/utils';
import { ROUTE_HOME } from '../../../../platform/routes/constants';
import { DeleteIcon } from '../SpaceSettings/icon/DeleteIcon';
import SpaceProfileDeleteDialog from '../SpaceSettings/SpaceProfileDeleteDialog';
import { PlanFeatures, PlanFooter, PlanName, PlanPrice } from '../../../../license/plans/ui/PlanCardsComponents';
import { usePlanTranslations } from '../../../../license/plans/utils/PlanTranslations';
import RouterLink from '../../../../../core/ui/link/RouterLink';

interface SpaceAccountPageProps {
  journeyId: string;
}

const SpaceAccountView: FC<SpaceAccountPageProps> = ({ journeyId }) => {
  const { t } = useTranslation();
  const planTranslations = usePlanTranslations();
  const notify = useNotification();
  const navigate = useNavigate();

  const errorColor = '#940000';

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const openDialog = () => setOpenDeleteDialog(true);
  const closeDialog = () => setOpenDeleteDialog(false);
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
                label="pages.admin.generic.sections.account.contactsLinkText"
                to={t('pages.admin.generic.sections.account.contactsLink')}
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
                            to={t('pages.admin.generic.sections.account.changePlanLink')}
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
                      <Caption
                        component={RouterLink}
                        to={t('pages.admin.generic.sections.account.changePlanLink')}
                        textAlign="center"
                      >
                        {t('pages.admin.generic.sections.account.upgradeTo')}
                        <PlanName inline>{plan.translation.displayName}</PlanName>
                      </Caption>
                      <PlanFeatures planTranslation={plan.translation} listItemComponent={Caption} />
                    </PageContentBlock>
                  ))}
                  {plansData.availableDowngrades.map(plan => (
                    <PageContentBlock key={plan.name}>
                      <Caption
                        component={RouterLink}
                        to={t('pages.admin.generic.sections.account.changePlanLink')}
                        textAlign="center"
                      >
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
