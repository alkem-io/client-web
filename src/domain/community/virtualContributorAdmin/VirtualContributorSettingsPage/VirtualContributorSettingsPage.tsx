import { useVirtualContributorQuery } from '@/core/apollo/generated/apollo-hooks';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import VCSettingsPageLayout from '../layout/VCSettingsPageLayout';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import VisibilityForm from '../components/VisibilityForm';
import BodyOfKnowledgeManagement from '../components/BodyOfKnowledgeManagement';
import PromptConfig from '../components/PromptConfig';
import ExternalConfig from '../components/ExternalConfig';
import { AiPersonaEngine } from '@/core/apollo/generated/graphql-schema';

const VirtualContributorSettingsPage = () => {
  const { vcId } = useUrlResolver();
  const { data } = useVirtualContributorQuery({
    variables: { id: vcId! },
    skip: !vcId,
  });

  const vc = data?.lookup.virtualContributor;

  const isExternalConfigAvailable = [
    AiPersonaEngine.LibraFlow,
    AiPersonaEngine.OpenaiAssistant,
    AiPersonaEngine.GenericOpenai,
  ].includes(vc?.aiPersona?.engine!);

  const isPromptConfigAvailable = [AiPersonaEngine.LibraFlow].includes(vc?.aiPersona?.engine!);

  if (!vc || !vc.aiPersona) {
    return null;
  }

  return (
    <StorageConfigContextProvider locationType="virtualContributor" virtualContributorId={vc?.id}>
      <VCSettingsPageLayout currentTab={SettingsSection.Settings}>
        <VisibilityForm vc={vc} />
        <BodyOfKnowledgeManagement vc={vc} />
        {isPromptConfigAvailable && <PromptConfig vc={vc} />}
        {isExternalConfigAvailable && <ExternalConfig vc={vc} />}
      </VCSettingsPageLayout>
    </StorageConfigContextProvider>
  );
};

export default VirtualContributorSettingsPage;
