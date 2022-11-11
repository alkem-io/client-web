import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useChallenge } from '../../../../hooks';
import { buildAdminChallengeUrl, buildChallengeUrl } from '../../../../common/utils/urlBuilders';
import { EntityTabsProps } from '../../../shared/layout/PageLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import EntityPageTabs from '../../../shared/layout/EntityPageTabs';
import { BatchPredictionOutlined } from '@mui/icons-material';

export interface ChallengeTabsProps extends EntityTabsProps {}

const ChallengeTabs: FC<ChallengeTabsProps> = props => {
  const { t } = useTranslation();

  const { hubNameId, challengeNameId, permissions } = useChallenge();
  const rootUrl = buildChallengeUrl(hubNameId, challengeNameId);
  const settingsUrl = buildAdminChallengeUrl(hubNameId, challengeNameId);

  return (
    <EntityPageTabs
      {...props}
      entityTypeName="challenge"
      showSettings={permissions.canUpdate}
      settingsUrl={settingsUrl}
      rootUrl={rootUrl}
      shareUrl={rootUrl}
      subEntityTab={{
        label: t('common.opportunities'),
        section: EntityPageSection.Opportunities,
        icon: <BatchPredictionOutlined />,
      }}
    />
  );
};

export default ChallengeTabs;
