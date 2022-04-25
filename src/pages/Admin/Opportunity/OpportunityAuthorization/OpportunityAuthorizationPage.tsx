import React, { FC } from 'react';
import OpportunitySettingsLayout from '../../../../domain/admin/opportunity/OpportunitySettingsLayout';
import { SettingsSection } from '../../../../domain/admin/layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../domain/admin/layout/EntitySettings/types';
import OpportunityAuthorizationView from './OpportunityAdminAuthorizationView';
import { useTranslation } from 'react-i18next';
import { AuthorizationCredential } from '../../../../models/graphql-schema';

const OpportunityAuthorizationPage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  const { t } = useTranslation();

  useAppendBreadcrumb(paths, {
    name: t(`common.enums.authorization-credentials.${AuthorizationCredential.OpportunityAdmin}.name` as const),
  });

  return (
    <OpportunitySettingsLayout currentTab={SettingsSection.Authorization} tabRoutePrefix={routePrefix}>
      <OpportunityAuthorizationView />
    </OpportunitySettingsLayout>
  );
};

export default OpportunityAuthorizationPage;
