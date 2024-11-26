import FormMode from '@/domain/platform/admin/components/FormMode';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import SubspaceSettingsLayout from '@/domain/platform/admin/subspace/SubspaceSettingsLayout';
import OpportunityProfileView from './OpportunityProfileView';

const OpportunityProfilePage = ({ routePrefix = '../' }: SettingsPageProps) => (
  <SubspaceSettingsLayout currentTab={SettingsSection.Profile} tabRoutePrefix={routePrefix}>
    <OpportunityProfileView mode={FormMode.update} />
  </SubspaceSettingsLayout>
);

export default OpportunityProfilePage;
