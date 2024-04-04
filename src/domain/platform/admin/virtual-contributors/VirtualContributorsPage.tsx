import React, { FC } from 'react';
import AdminLayout from '../layout/toplevel/AdminLayout';
import { AdminSection } from '../layout/toplevel/constants';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import { Form, Formik } from 'formik';
import { Actions } from '../../../../core/ui/actions/Actions';
import { LoadingButton } from '@mui/lab';
import Gutters from '../../../../core/ui/grid/Gutters';
import { gutters } from '../../../../core/ui/grid/utils';
import { useCookies } from 'react-cookie';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import useLoadingState from '../../../shared/utils/useLoadingState';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { useAdminVirtualContributorsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import Avatar from '../../../../core/ui/avatar/Avatar';
import { BlockTitle } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import { ExpandMore } from '@mui/icons-material';
import VirtualContributorForm from './VirtualContributorForm';

interface VirtualContributorsConfig {
}

interface AISettingsPageProps {}

// TODO: Remove this NOW
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const AISettingsPage: FC<AISettingsPageProps> = () => {
  const notify = useNotification();
  const { t } = useTranslation();

  const { data, loading } = useAdminVirtualContributorsQuery();

  const [onSave, isSaving] = useLoadingState(async (values: VirtualContributorsConfig) => {
    notify('Settings saved', 'success');
  });

  const textAreasStyle = {
    InputProps: {
      sx: { fontFamily: 'monospace', height: gutters(20) },
    },
    sx: { height: gutters(20), div: { alignItems: 'flex-start' } },
  };

  return (
    <AdminLayout currentTab={AdminSection.AISettings}>
      <PageContentBlock>
        {data?.virtualContributors.map(virtualContributor => (
          <Accordion key={virtualContributor.id}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Gutters row alignItems="center">
                <Avatar src={virtualContributor.profile.avatar?.uri} alt={t('common.avatar-of', { user: virtualContributor.profile.displayName })} />
                <BlockTitle>{virtualContributor.profile.displayName}</BlockTitle>
              </Gutters>
            </AccordionSummary>
            <AccordionDetails>
              <VirtualContributorForm virtualContributor={virtualContributor} />
            </AccordionDetails>
          </Accordion>
        ))}
      </PageContentBlock>
    </AdminLayout>
  );
};

export default AISettingsPage;
