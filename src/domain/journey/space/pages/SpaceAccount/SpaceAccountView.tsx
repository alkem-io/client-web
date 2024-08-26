import { Box, CircularProgress, Link, styled } from '@mui/material';
import { FC, PropsWithChildren, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  refetchAdminSpacesListQuery,
  useDeleteSpaceMutation,
  useSpaceAccountQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, LicensePlanType } from '../../../../../core/apollo/generated/graphql-schema';
import useNavigate from '../../../../../core/routing/useNavigate';
import ContributorCardHorizontal from '../../../../../core/ui/card/ContributorCardHorizontal';
import PageContent from '../../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import SeeMore from '../../../../../core/ui/content/SeeMore';
import Gutters from '../../../../../core/ui/grid/Gutters';
import { gutters } from '../../../../../core/ui/grid/utils';
import RouterLink from '../../../../../core/ui/link/RouterLink';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import { BlockTitle, Caption, CaptionSmall } from '../../../../../core/ui/typography';
import { PlanFeatures, PlanFooter, PlanName } from '../../../../license/plans/ui/PlanCardsComponents';
import { getPlanTranslations } from '../../../../license/plans/utils/getPlanTranslations';
import { ROUTE_HOME } from '../../../../platform/routes/constants';
import DeleteIcon from '@mui/icons-material/Delete';
import CachedIcon from '@mui/icons-material/Cached';
import SpaceProfileDeleteDialog from '../SpaceSettings/SpaceProfileDeleteDialog';
import { SvgIconComponent } from '@mui/icons-material';
import { useUserContext } from '../../../../community/user';
import translateWithElements from '../../../../shared/i18n/TranslateWithElements/TranslateWithElements';

interface SpaceAccountPageProps {
  journeyId: string;
}

const StyledPageContentBlock = styled(PageContentBlock)(({ theme }) => ({
  color: theme.palette.primary.main,
  svg: { verticalAlign: 'middle', marginRight: gutters(0.5) },
}));

const LicenseActionBlock = ({
  title,
  description,
  disabled,
  icon: Icon,
  onClick,
  children,
}: PropsWithChildren<{
  icon: SvgIconComponent;
  title: string;
  description: string;
  disabled?: boolean;
  onClick: () => void;
}>) => (
  <StyledPageContentBlock>
    {disabled ? (
      <Caption>
        <Icon fontSize="small" />
        {title}
      </Caption>
    ) : (
      <Caption onClick={onClick} sx={{ cursor: 'pointer' }}>
        <Icon fontSize="small" />
        {title}
      </Caption>
    )}
    <CaptionSmall>{description}</CaptionSmall>
    {children}
  </StyledPageContentBlock>
);

const SpaceAccountView: FC<SpaceAccountPageProps> = ({ journeyId }) => {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const notify = useNotification();
  const navigate = useNavigate();
  const planTranslations = getPlanTranslations(t);
  const tLink = translateWithElements(<Link />);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data, loading: loadingAccount } = useSpaceAccountQuery({
    variables: { spaceId: journeyId },
  });

  const space = data?.lookup.space;
  const isHost = data?.lookup.space?.provider.id === user?.user.id;
  const canDelete = (space?.authorization?.myPrivileges ?? [])?.includes(AuthorizationPrivilege.Delete);
  const contactsLink = data?.platform.configuration.locations.support;
  const switchPlanLink = data?.platform.configuration.locations.switchplan;

  const plansData = useMemo(() => {
    const activeSubscription = space?.activeSubscription;

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

    const daysLeft =
      activeSubscription && activeSubscription.expires
        ? Math.ceil((new Date(activeSubscription.expires).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : undefined;

    return {
      currentPlan,
      daysLeft,
    };
  }, [data]);

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

  const loading = loadingAccount && deletingSpace;

  return (
    <PageContent background="transparent">
      {!loading && space && (
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
                  displayName: space.provider.profile.displayName,
                  avatar: space.provider.profile.avatar,
                  location: space.provider.profile.location,
                  tagsets: undefined,
                  url: space?.provider.profile.url,
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
                          {t('pages.admin.generic.sections.account.freeTrialNotice.title', {
                            daysLeft: plansData.daysLeft,
                          })}
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
                    onClick={() => navigate(`${user?.user.profile.url}/settings/account`)}
                  />
                  <LicenseActionBlock
                    title={t('pages.admin.generic.sections.account.deleteSpace')}
                    description={t(
                      `pages.admin.generic.sections.account.deleteSpace_${
                        canDelete ? 'description' : 'disallowed'
                      }` as const
                    )}
                    disabled={!canDelete}
                    icon={DeleteIcon}
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Caption color={theme => theme.palette.error.dark} textAlign="right">
                      {t('components.deleteSpace.title')}
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
            <SpaceProfileDeleteDialog
              entity={t('common.space')}
              open={deleteDialogOpen}
              onClose={() => setDeleteDialogOpen(false)}
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
