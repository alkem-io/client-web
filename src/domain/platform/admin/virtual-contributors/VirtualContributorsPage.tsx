import React, { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AdminLayout from '../layout/toplevel/AdminLayout';
import { AdminSection } from '../layout/toplevel/constants';
import {
  useAdminVirtualContributorsQuery,
  useUpdateVirtualContributorMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { Accordion, AccordionDetails, AccordionSummary, Button } from '@mui/material';
import Avatar from '../../../../core/ui/avatar/Avatar';
import { BlockTitle } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import { ExpandMore } from '@mui/icons-material';
import VirtualContributorForm, { VirtualContributorFormValues } from './VirtualContributorForm';
import { Actions } from '../../../../core/ui/actions/Actions';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { StorageConfigContextProvider } from '../../../storage/StorageBucket/StorageConfigContext';

const VirtualContributorsPage: FC = () => {
  const { t } = useTranslation();
  const { data } = useAdminVirtualContributorsQuery();
  const location = useLocation();

  const [updateContributorMutation] = useUpdateVirtualContributorMutation();

  const handleUpdateContributor = async ({
    id,
    displayName,
    description,
  }: Identifiable & VirtualContributorFormValues) => {
    await updateContributorMutation({
      variables: {
        virtualContributorData: {
          ID: id,
          profileData: {
            displayName: displayName,
            description: description,
          },
        },
      },
    });
  };

  return (
    <AdminLayout currentTab={AdminSection.VirtualContributors}>
      <Actions justifyContent="end">
        <Link to={`${location.pathname}/new-persona`}>
          <Button variant="text">New Persona</Button>
        </Link>
        <Link to={`${location.pathname}/new-virtual-contributor`}>
          <Button variant="text">New Virtual Contributor</Button>
        </Link>
      </Actions>
      <PageContentBlockSeamless disablePadding disableGap>
        <StorageConfigContextProvider locationType="platform">
          {data?.virtualContributors.map(virtualContributor => (
            <Accordion key={virtualContributor.id}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <BadgeCardView
                  visual={
                    <Avatar
                      src={virtualContributor.profile.avatar?.uri}
                      alt={t('common.avatar-of', { user: virtualContributor.profile.displayName })}
                    />
                  }
                >
                  <BlockTitle>{virtualContributor.profile.displayName}</BlockTitle>
                </BadgeCardView>
              </AccordionSummary>
              <AccordionDetails>
                <VirtualContributorForm virtualContributor={virtualContributor} onSave={handleUpdateContributor} />
              </AccordionDetails>
            </Accordion>
          ))}
        </StorageConfigContextProvider>
      </PageContentBlockSeamless>
    </AdminLayout>
  );
};

export default VirtualContributorsPage;
