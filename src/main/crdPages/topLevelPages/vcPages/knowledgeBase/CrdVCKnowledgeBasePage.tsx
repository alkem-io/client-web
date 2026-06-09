import { VCKnowledgeBaseView } from '@/crd/components/virtualContributor/knowledgeBase/VCKnowledgeBaseView';
import { CalloutListConnector } from '@/main/crdPages/space/callout/CalloutListConnector';
import { useVcKnowledgeBaseData } from './useVcKnowledgeBaseData';

/**
 * CRD Knowledge Base page for a Virtual Contributor (`/vc/:nameId/knowledge-base`).
 * Replaces the legacy MUI `KnowledgeBaseDialog`/route. The knowledge body reuses
 * the CRD callouts feed (`CalloutListConnector`) rather than the MUI
 * `CalloutsGroupView`, keeping the page fully in the new design.
 */
export const CrdVCKnowledgeBasePage = () => {
  const { viewProps, callouts, calloutsSetId, canReorder, calloutsLoading } = useVcKnowledgeBaseData();

  return (
    <VCKnowledgeBaseView
      {...viewProps}
      calloutsSlot={
        <CalloutListConnector
          callouts={callouts}
          calloutsSetId={calloutsSetId}
          canReorder={canReorder}
          loading={calloutsLoading}
        />
      }
    />
  );
};

export default CrdVCKnowledgeBasePage;
