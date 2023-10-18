import ProfileTabs from '../../../shared/layout/ProfileTabs';
import { useMemo } from 'react';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { buildInnovationPackSettingsUrl, buildInnovationPackUrl } from '../urlBuilders';
import InnovationPackIcon from '../InnovationPackIcon';
import { EntityTabsProps } from '../../../journey/common/EntityPageLayout';

export interface InnovationPageTabsProps extends EntityTabsProps {
  showSettings: boolean;
}

/**
 * @deprecated
 * // TODO remove
 */
const InnovationPageTabs = ({ showSettings, ...props }: InnovationPageTabsProps) => {
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
    <ProfileTabs
      showSettings={showSettings}
      profileIconComponent={InnovationPackIcon}
      routes={routes}
      entityTypeName="innovationPack"
      shareUrl={buildInnovationPackUrl(innovationPackNameId)}
      {...props}
    />
  );
};

export default InnovationPageTabs;
