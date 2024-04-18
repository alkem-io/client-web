import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { useOpportunity } from '../../../journey/opportunity/hooks/useOpportunity';
import EntitySettingsLayout from '../layout/EntitySettingsLayout/EntitySettingsLayout';
import ChildJourneyPageBanner from '../../../journey/common/childJourneyPageBanner/ChildJourneyPageBanner';
import OpportunityTabs from '../../../journey/opportunity/layout/OpportunityTabs';
import { TabDefinition } from '../layout/EntitySettingsLayout/EntitySettingsTabs';
import { Link } from '@mui/material';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import JourneyBreadcrumbs from '../../../journey/common/journeyBreadcrumbs/JourneyBreadcrumbs';
import BackButton from '../../../../core/ui/actions/BackButton';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';

interface OpportunitySettingsLayoutProps {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
}

const tabs: TabDefinition<SettingsSection>[] = [
  {
    section: SettingsSection.Profile,
    route: 'profile',
    icon: PeopleOutlinedIcon,
  },
  {
    section: SettingsSection.Context,
    route: 'context',
    icon: ListOutlinedIcon,
  },
  {
    section: SettingsSection.Community,
    route: 'community',
    icon: PeopleOutlinedIcon,
  },
  {
    section: SettingsSection.Communications,
    route: 'communications',
    icon: ForumOutlinedIcon,
  },
];

const OpportunitySettingsLayout: FC<OpportunitySettingsLayoutProps> = props => {
  const entityAttrs = useOpportunity();
  const { t } = useTranslation();

  return (
    <EntitySettingsLayout
      entityTypeName="subsubspace"
      subheaderTabs={tabs}
      pageBannerComponent={ChildJourneyPageBanner}
      tabsComponent={OpportunityTabs}
      breadcrumbs={<JourneyBreadcrumbs settings />}
      backButton={
        <Link
          href={`${entityAttrs.profile.url}/${EntityPageSection.Dashboard}`}
          sx={{ alignSelf: 'center', marginLeft: 'auto' }}
        >
          <BackButton variant="outlined" sx={{ textTransform: 'capitalize' }}>
            {t('navigation.admin.settingsMenu.quit')}
          </BackButton>
        </Link>
      }
      {...entityAttrs}
      {...props}
    />
  );
};

export default OpportunitySettingsLayout;
