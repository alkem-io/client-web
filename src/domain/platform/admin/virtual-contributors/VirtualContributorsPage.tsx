import React, { FC } from 'react';
import AdminLayout from '../layout/toplevel/AdminLayout';
import { AdminSection } from '../layout/toplevel/constants';
import Gutters from '../../../../core/ui/grid/Gutters';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { useAdminVirtualContributorsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import Avatar from '../../../../core/ui/avatar/Avatar';
import { BlockTitle } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import { ExpandMore } from '@mui/icons-material';
import VirtualContributorForm from './VirtualContributorForm';

interface AISettingsPageProps {}

const AISettingsPage: FC<AISettingsPageProps> = () => {
  const { t } = useTranslation();

  const { data } = useAdminVirtualContributorsQuery();

  return (
    <AdminLayout currentTab={AdminSection.AISettings}>
      <PageContentBlock>
        {data?.virtualContributors.map(virtualContributor => (
          <Accordion key={virtualContributor.id}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Gutters row alignItems="center">
                <Avatar
                  src={virtualContributor.profile.avatar?.uri}
                  alt={t('common.avatar-of', { user: virtualContributor.profile.displayName })}
                />
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
