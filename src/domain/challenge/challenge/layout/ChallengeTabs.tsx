import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useChallenge } from '../hooks/useChallenge';
import { buildAdminChallengeUrl, buildChallengeUrl } from '../../../../common/utils/urlBuilders';
import { EntityTabsProps } from '../../common/EntityPageLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import JourneyPageTabs from '../../common/JourneyPageTabs';
import { OpportunityIcon } from '../../opportunity/icon/OpportunityIcon';

export interface ChallengeTabsProps extends EntityTabsProps {}

const ChallengeTabs: FC<ChallengeTabsProps> = props => {
  const { t } = useTranslation();

  const { spaceNameId, challengeNameId, permissions } = useChallenge();
  const rootUrl = buildChallengeUrl(spaceNameId, challengeNameId);
  const settingsUrl = buildAdminChallengeUrl(spaceNameId, challengeNameId);

  return (
    <JourneyPageTabs
      {...props}
      entityTypeName="challenge"
      showSettings={permissions.canUpdate}
      settingsUrl={settingsUrl}
      rootUrl={rootUrl}
      shareUrl={rootUrl}
      subEntityTab={{
        label: t('common.opportunities'),
        section: EntityPageSection.Opportunities,
        icon: <OpportunityIcon />,
      }}
      hideAbout
    />
  );
};

export default ChallengeTabs;
