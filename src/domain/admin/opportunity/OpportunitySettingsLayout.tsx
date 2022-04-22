import React, { FC } from 'react';
import { CommonTabs, SettingsSection } from '../layout/EntitySettings/constants';
import { useOpportunity } from '../../../hooks';
import EntitySettingsLayout from '../layout/EntitySettings/EntitySettingsLayout';

interface OpportunitySettingsLayoutProps {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
}

const OpportunitySettingsLayout: FC<OpportunitySettingsLayoutProps> = props => {
  const entityAttrs = useOpportunity();

  return <EntitySettingsLayout entityTypeName="opportunity" tabs={CommonTabs} {...entityAttrs} {...props} />;
};

export default OpportunitySettingsLayout;
