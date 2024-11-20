import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import SubspaceSettingsLayout from '@/domain/platform/admin/subspace/SubspaceSettingsLayout';
import OpportunityContextView from './OpportunityContextView';

const OpportunityContextPage = ({ routePrefix = '../' }: SettingsPageProps) => (
  <SubspaceSettingsLayout currentTab={SettingsSection.Context} tabRoutePrefix={routePrefix}>
    <OpportunityContextView />
  </SubspaceSettingsLayout>
);

export default OpportunityContextPage;
