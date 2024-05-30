import { FC, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Skeleton, styled } from '@mui/material';
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

interface SpaceAccountPageProps {
  journeyId: string;
}

const PlanName = styled('h1')(({ theme }) => ({
  color: theme.palette.primary.main,
  textAlign: 'center',
  margin: 0,
}));

const Price = styled('h1')(({ theme }) => ({
  color: theme.palette.primary.main,
}));

const SpaceAccountView: FC<SpaceAccountPageProps> = ({ journeyId }) => {
  const { t } = useTranslation();
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
    const plans = [...(data?.platform.licensing.plans ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

    if (!data || !activeSubscription) {
      return undefined;
    }
    const currentPlan = plans.find(plan => plan.licenseCredential === activeSubscription.name);
    if (!currentPlan) {
      return undefined;
    }

    const currentPlanIndex = plans.findIndex(plan => plan.licenseCredential === currentPlan.name);

    const nextPlan = plans[currentPlanIndex + 1] ?? null;
    const previousPlan = plans[currentPlanIndex - 1] ?? null;

    return {
      plans,
      currentPlan,
      nextPlan,
      previousPlan,
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
          <PageContentBlock columns={6} sx={{ gap: gutters(2) }}>
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
          <PageContentBlock columns={6} sx={{ gap: gutters(2) }}>
            <Gutters disablePadding>
              <BlockTitle>{t('common.license')}</BlockTitle>
              <Box display="flex" width="100%" gap={gutters()} alignItems="stretch">
                <Box width="50%">
                  <PageContentBlock fullHeight sx={{ borderColor: theme => theme.palette.primary.main }}>
                    <Gutters>
                      <Caption>Your current license:</Caption>
                      {plansData.currentPlan && (
                        <>
                          <PlanName>{plansData.currentPlan.name}</PlanName>
                          <Price>{plansData.currentPlan.pricePerMonth}</Price>
                        </>
                      )}
                      {!plansData.currentPlan && (
                        <>
                          <Skeleton variant="text" />
                          <Skeleton variant="text" />
                          <Skeleton variant="text" />
                        </>
                      )}
                    </Gutters>
                  </PageContentBlock>
                </Box>
                <Box width="50%" display="flex" flexDirection="column" gap={gutters()}>
                  <PageContentBlock>upgrade to</PageContentBlock>
                  <PageContentBlock>upgrade to</PageContentBlock>
                </Box>
              </Box>
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
