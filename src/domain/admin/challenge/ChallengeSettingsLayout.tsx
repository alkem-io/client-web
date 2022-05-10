import React, { FC } from 'react';
import { SettingsSection } from '../layout/EntitySettings/constants';
import { TabDefinition } from '../../../components/core/PageTabs/PageTabs';
import { useChallenge } from '../../../hooks';
import { CommonTabs } from '../layout/EntitySettings/constants';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import EntitySettingsLayout from '../layout/EntitySettings/EntitySettingsLayout';

interface ChallengeSettingsLayoutProps {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
}

const tabs: TabDefinition<SettingsSection>[] = [
  ...CommonTabs,
  {
    section: SettingsSection.Opportunities,
    route: 'opportunities',
    icon: FlagOutlinedIcon,
  },
];

const ChallengeSettingsLayout: FC<ChallengeSettingsLayoutProps> = props => {
  const entityAttrs = useChallenge();

  return <EntitySettingsLayout entityTypeName="challenge" tabs={tabs} {...entityAttrs} {...props} />;
};

export default ChallengeSettingsLayout;
