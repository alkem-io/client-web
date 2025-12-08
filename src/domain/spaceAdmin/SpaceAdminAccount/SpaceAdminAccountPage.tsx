import {
  useDeleteSpaceMutation,
  useOrganizationAuthorizationLazyQuery,
  useSpaceAccountQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, LicensingCredentialBasedPlanType } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import ContributorCardHorizontal from '@/core/ui/card/ContributorCardHorizontal';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import SeeMore from '@/core/ui/content/SeeMore';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import RouterLink from '@/core/ui/link/RouterLink';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { BlockTitle, Caption } from '@/core/ui/typography';
import useEnsurePresence from '@/core/utils/ensurePresence';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { PlanFeatures, PlanFooter, PlanName } from '@/domain/license/plans/ui/PlanCardsComponents';
import { getPlanTranslations } from '@/domain/license/plans/utils/getPlanTranslations';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import type { SettingsPageProps } from '@/domain/platformAdmin/layout/EntitySettingsLayout/types';
import { useConfig } from '@/domain/platform/config/useConfig';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import EntityConfirmDeleteDialog from '@/domain/shared/components/EntityConfirmDeleteDialog';
import translateWithElements from '@/domain/shared/i18n/TranslateWithElements/TranslateWithElements';
import SpaceSettingsLayout from '@/domain/spaceAdmin/layout/SpaceAdminLayoutSpace';
import CachedIcon from '@mui/icons-material/Cached';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Box, CircularProgress, Link } from '@mui/material';
import { FC, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import LicenseActionBlock from './components/LicenseActionBlock';

export interface SpaceAdminAccountPageProps extends SettingsPageProps {
  useL0Layout: boolean;
  spaceId: string;
}

const SpaceAdminAccountPage: FC<SpaceAdminAccountPageProps> = ({ spaceId, routePrefix = '../' }) => {
  const { t } = useTranslation();
  const { userModel } = useCurrentUserContext();
  const notify = useNotification();
  const navigate = useNavigate();
  const planTranslations = getPlanTranslations(t);
  const ensurePresence = useEnsurePresence();
  const tLink = translateWithElements(<Link target="_blank" />);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data, loading } = useSpaceAccountQuery({
    variables: { spaceId: spaceId! },
    skip: !spaceId,
  });

  const [fetchOrganizationAuthorization, { data: organizationData }] = useOrganizationAuthorizationLazyQuery();

  const { locations } = useConfig();

  const space = data?.lookup.space;
  const canDelete = (space?.authorization?.myPrivileges ?? [])?.includes(AuthorizationPrivilege.Delete);
  const contactsLink = data?.platform.configuration.locations.support;
  const switchPlanLink = data?.platform.configuration.locations.switchplan;

  const provider = data?.lookup.space?.about.provider;
  const [isHost, setIsHost] = useState(false);
  useEffect(() => {
    // TODO: After server #4471 we should be able to see account.type to check if the space provider is a User or an Organization, and this __typename can be removed from the query
    if (provider?.__typename === 'User') {
      setIsHost(provider?.id === userModel?.id);
    } else if (provider?.__typename === 'Organization') {
      if (!organizationData) {
        fetchOrganizationAuthorization({
          variables: {
            organizationId: provider.id,
          },
        });
      } else {
        setIsHost(
          organizationData.lookup.organization?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ??
            false
        );
      }
    }
  }, [provider, organizationData]);

  const plansData = useMemo(() => {
    const activeSubscription = space?.activeSubscription;

    // Need to clone the array to be able to sort it:
    const plans = [...(data?.platform.licensingFramework.plans ?? [])]
      .filter(plan => plan.type === LicensingCredentialBasedPlanType.SpacePlan)
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

    const daysLeft =
      activeSubscription && activeSubscription.expires
        ? Math.ceil((new Date(activeSubscription.expires).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : undefined;

    return {
      currentPlan,
      daysLeft,
    };
  }, [data]);

  const [deleteSpace] = useDeleteSpaceMutation({
    onCompleted: () => {
      notify(t('pages.admin.space.notifications.space-removed'), 'success');
      navigate(ROUTE_HOME, { replace: true });
      // Resetting the Apollo cache is not working well, because the page has not fully navigated
      // to the dashboard when we reset, so Apollo is trying to reload SpaceProvider
      // with the "just deleted" spaceId. With navigate(0) we just reload the page and that clears the cache.
      navigate(0);
    },
  });

  const handleDelete = (id: string | undefined) => {
    const requiredSpaceId = ensurePresence(id, 'SpaceId');
    return deleteSpace({
      variables: {
        spaceId: requiredSpaceId,
      },
    });
  };
  return (
    <SpaceSettingsLayout currentTab={SettingsSection.Account} tabRoutePrefix={routePrefix}>
      <PageContent background="transparent">
        {!loading && space && (
          <>
            <PageContentBlock columns={5} sx={{ gap: gutters(2) }}>
              <Gutters disablePadding>
                <BlockTitle>{t('common.url')}</BlockTitle>
                <Caption>{space.about.profile.url}</Caption>
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
                    displayName: space.about.provider?.profile.displayName ?? '',
                    avatar: space.about.provider?.profile.avatar,
                    location: space.about.provider?.profile.location,
                    tagsets: undefined,
                    url: space?.about.provider?.profile.url,
                  }}
                  seamless
                />
              </Gutters>
              <Gutters disablePadding>
                <SeeMore
                  label="pages.admin.generic.sections.account.contactsLink"
                  to={contactsLink}
                  sx={{ textAlign: 'left' }}
                />
              </Gutters>
            </PageContentBlock>
            <PageContentBlock columns={7} sx={{ gap: gutters(2) }}>
              <Gutters disablePadding>
                <BlockTitle>{t('common.license')}</BlockTitle>
                <Gutters row disablePadding>
                  {plansData?.currentPlan && (
                    <Box width="50%">
                      <PageContentBlock fullHeight sx={{ borderColor: theme => theme.palette.primary.main }}>
                        <Caption textAlign="center">{t('pages.admin.generic.sections.account.yourLicense')}</Caption>
                        <PlanName>{plansData.currentPlan.translation.displayName}</PlanName>
                        <PlanFeatures planTranslation={plansData.currentPlan.translation} listItemComponent={Caption} />
                        <PlanFooter>
                          <BlockTitle>
                            {plansData.daysLeft
                              ? t('pages.admin.generic.sections.account.freeTrialNotice.titleWithDaysLeft', {
                                  daysLeft: plansData.daysLeft,
                                })
                              : t('pages.admin.generic.sections.account.freeTrialNotice.title')}
                          </BlockTitle>
                          {switchPlanLink && (
                            <Caption
                              component={RouterLink}
                              to={switchPlanLink}
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
                          )}
                        </PlanFooter>
                      </PageContentBlock>
                    </Box>
                  )}

                  <Gutters disablePadding width="50%">
                    <LicenseActionBlock
                      title={t('pages.admin.generic.sections.account.changeLicense')}
                      description={t(
                        `pages.admin.generic.sections.account.changeLicense_${
                          isHost ? 'description' : 'disallowed'
                        }` as const
                      )}
                      disabled={!isHost}
                      icon={CachedIcon}
                      href={locations?.feedback}
                      // TODO: Temporarily redirect to Alkemio contact page until the account settings tab is ready to handle a license change
                      // onClick={() => navigate(`${provider?.profile.url}/settings/account`)}
                    />
                    <LicenseActionBlock
                      title={t('pages.admin.generic.sections.account.deleteSpace')}
                      description={t(
                        `pages.admin.generic.sections.account.deleteSpace_${
                          canDelete ? 'description' : 'disallowed'
                        }` as const
                      )}
                      disabled={!canDelete}
                      icon={DeleteOutlineIcon}
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Caption sx={{ color: theme => theme.palette.error.dark }} textAlign="right">
                        {t('components.deleteEntity.title')}
                      </Caption>
                    </LicenseActionBlock>
                  </Gutters>
                </Gutters>
                {isHost && (
                  <Caption>
                    {tLink('pages.admin.generic.sections.account.moreInfo', {
                      moreinfo: { href: t('pages.admin.generic.sections.account.moreInfoUrl') },
                    })}
                  </Caption>
                )}
              </Gutters>
            </PageContentBlock>
            {deleteDialogOpen && (
              <EntityConfirmDeleteDialog
                entity={t('common.space')}
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onDelete={() => handleDelete(spaceId)}
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
    </SpaceSettingsLayout>
  );
};

export default SpaceAdminAccountPage;
