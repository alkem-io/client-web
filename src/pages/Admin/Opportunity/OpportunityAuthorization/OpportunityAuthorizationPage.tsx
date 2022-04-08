import React, { FC } from 'react';
import OpportunitySettingsLayout from '../../../../components/composite/layout/OpportunitySettingsLayout/OpportunitySettingsLayout';
import { SettingsSection } from '../../../../components/composite/layout/EntitySettingsLayout/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../components/composite/layout/EntitySettingsLayout/types';
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
