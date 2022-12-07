import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useOpportunity } from '../hooks/useOpportunity';
import { buildAdminOpportunityUrl, buildOpportunityUrl } from '../../../../common/utils/urlBuilders';
import { EntityTabsProps } from '../../../shared/layout/PageLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import EntityPageTabs from '../../../shared/layout/EntityPageTabs';
import { HandshakeOutlined } from '@mui/icons-material';

export interface OpportunityTabsProps extends EntityTabsProps {}

const OpportunityTabs: FC<OpportunityTabsProps> = props => {
  const { t } = useTranslation();

  const { hubNameId, challengeNameId, opportunityNameId, permissions } = useOpportunity();
  const rootUrl = buildOpportunityUrl(hubNameId, challengeNameId, opportunityNameId);
  const settingsUrl = buildAdminOpportunityUrl(hubNameId, challengeNameId, opportunityNameId);

  return (
    <EntityPageTabs
      {...props}
      entityTypeName="opportunity"
      showSettings={permissions.viewerCanUpdate}
      settingsUrl={settingsUrl}
      rootUrl={rootUrl}
      shareUrl={rootUrl}
      subEntityTab={{
        label: t('common.agreements'),
        section: EntityPageSection.Agreements,
        icon: <HandshakeOutlined />,
      }}
    />
  );
};

export default OpportunityTabs;
