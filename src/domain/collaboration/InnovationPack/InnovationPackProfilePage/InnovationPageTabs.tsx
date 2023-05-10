import ProfileTabs from '../../../shared/layout/ProfileTabs';
import { useMemo } from 'react';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { buildInnovationPackSettingsUrl, buildInnovationPackUrl } from '../urlBuilders';
import InnovationPackIcon from '../InnovationPackIcon';
import { EntityTabsProps } from '../../../challenge/common/EntityPageLayout';

const InnovationPageTabs = (props: EntityTabsProps) => {
  const { innovationPackNameId } = useUrlParams();

  if (!innovationPackNameId) {
    throw new Error('Must be within an Innovation Pack');
  }

  const routes = useMemo(
    () => ({
      [EntityPageSection.Profile]: buildInnovationPackUrl(innovationPackNameId),
      [EntityPageSection.Settings]: buildInnovationPackSettingsUrl(innovationPackNameId),
    }),
    [innovationPackNameId]
  );

  return (
    <ProfileTabs showSettings={true && true} profileIconComponent={InnovationPackIcon} routes={routes} {...props} />
  );
};

export default InnovationPageTabs;
