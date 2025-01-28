import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Grid from '@mui/material/Grid';
import { Identifiable } from '@/core/utils/Identifiable';
import ContributorCardHorizontal from '@/core/ui/card/ContributorCardHorizontal';
import Loading from '@/core/ui/loading/Loading';
import useDirectMessageDialog from '@/domain/communication/messaging/DirectMessaging/useDirectMessageDialog';
import GridItem from '@/core/ui/grid/GridItem';
import Gutters from '@/core/ui/grid/Gutters';
import LabeledCount from '@/core/ui/content/LabeledCount';

export interface OrganizationCardProps {
  name?: string;
  avatar?: string;
  city?: string;
  country?: string;
  associatesCount?: number;
  verified?: boolean;
  loading?: boolean;
  url?: string;
}

export interface ContributingOrganizationsProps {
  loading?: boolean;
  organizations: (OrganizationCardProps & Identifiable)[] | undefined;
  noOrganizationsView?: ReactElement;
}

const ContributingOrganizations = ({
  organizations,
  loading = false,
  noOrganizationsView,
}: ContributingOrganizationsProps) => {
  const { t } = useTranslation();
  const directMessageDialogOptions = {
    dialogTitle: t('send-message-dialog.direct-message-title'),
  };
  const { sendMessage, directMessageDialog } = useDirectMessageDialog(directMessageDialogOptions);

  if (loading) {
    return (
      <Grid container spacing={3}>
        <Loading />
      </Grid>
    );
  }

  if (organizations?.length === 0) {
    return noOrganizationsView ?? null;
  }

  const renderAssociatesCount = (org: OrganizationCardProps & Identifiable) => (
    <LabeledCount
      label={t('components.associates.name')}
      count={org.associatesCount ?? 0}
      loading={loading}
      verified={org.verified}
    />
  );

  const mappedOrganizations = organizations?.map(org => ({
    id: org.id,
    profile:
      {
        displayName: org.name || '',
        avatar: {
          uri: org.avatar || '',
        },
        location: {
          city: org.city,
          country: org.country,
        },
        url: org.url,
      } || undefined,
    titleEndAmendment: renderAssociatesCount(org),
    onContact: () => {
      sendMessage('organization', {
        id: org.id,
        avatarUri: org.avatar,
        displayName: org.name,
        city: org.city,
        country: org.country,
      });
    },
  }));

  return (
    <>
      {mappedOrganizations?.map(org => (
        <GridItem key={org.id} columns={4}>
          <Gutters paddingX={0} paddingY={1}>
            <ContributorCardHorizontal {...org} seamless />
          </Gutters>
        </GridItem>
      ))}
      {directMessageDialog}
    </>
  );
};

export default ContributingOrganizations;
