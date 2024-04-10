import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubSpace } from '../hooks/useChallenge';
import { EntityTabsProps } from '../../common/EntityPageLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import JourneyPageTabs from '../../common/JourneyPageTabs';
import { OpportunityIcon } from '../../opportunity/icon/OpportunityIcon';
import { buildJourneyAdminUrl } from '../../../../main/routing/urlBuilders';

export interface SubspaceTabsProps extends EntityTabsProps {}

const SubspaceTabs: FC<SubspaceTabsProps> = props => {
  const { t } = useTranslation();

  const { permissions, profile } = useSubSpace();

  return (
    <JourneyPageTabs
      {...props}
      entityTypeName="subspace"
      showSettings={permissions.canUpdate}
      settingsUrl={buildJourneyAdminUrl(profile.url)}
      rootUrl={profile.url}
      shareUrl={profile.url}
      subEntityTab={{
        label: t('common.subspaces'),
        section: EntityPageSection.Subsubspaces,
        icon: <OpportunityIcon />,
      }}
      hideAbout
    />
  );
};

export default SubspaceTabs;
