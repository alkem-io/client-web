import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import OpportunitySettingsView from './OpportunitySettingsView';
import SubspaceSettingsLayout from '@/domain/space/routing/toReviewAdmin/SubspaceSettingsLayout';

const OpportunitySettingsPage = ({ routePrefix = '../' }: SettingsPageProps) => (
  <SubspaceSettingsLayout currentTab={SettingsSection.SpaceSettings} tabRoutePrefix={routePrefix}>
    <OpportunitySettingsView />
  </SubspaceSettingsLayout>
);

export default OpportunitySettingsPage;
