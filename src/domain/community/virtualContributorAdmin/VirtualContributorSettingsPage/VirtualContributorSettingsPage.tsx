import { useVirtualContributorQuery } from '@/core/apollo/generated/apollo-hooks';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import VCSettingsPageLayout from '../layout/VCSettingsPageLayout';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import VisibilityForm from '../components/VisibilityForm';
import BodyOfKnowledgeManagement from '../components/BodyOfKnowledgeManagement';
import PromptConfig from '../components/PromptConfig';

const VirtualContributorSettingsPage = () => {
  const { vcId } = useUrlResolver();
  const { data } = useVirtualContributorQuery({
    variables: { id: vcId! },
    skip: !vcId,
  });

  const vc = data?.lookup.virtualContributor;
  if (!vc) {
    return null;
  }

  return (
    <StorageConfigContextProvider locationType="virtualContributor" virtualContributorId={vc?.id}>
      <VCSettingsPageLayout currentTab={SettingsSection.Settings}>
        <VisibilityForm vc={vc} />
        <PromptConfig vc={vc} />
        <BodyOfKnowledgeManagement vc={vc} />
      </VCSettingsPageLayout>
    </StorageConfigContextProvider>
  );
};

export default VirtualContributorSettingsPage;
