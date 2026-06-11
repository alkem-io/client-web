import { useState } from 'react';
import { LONG_MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { VCKnowledgeBaseView } from '@/crd/components/virtualContributor/knowledgeBase/VCKnowledgeBaseView';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { MarkdownUploadScope } from '@/main/crdPages/markdown/MarkdownUploadScope';
import { CalloutFormConnector } from '@/main/crdPages/space/callout/CalloutFormConnector';
import { CalloutListConnector } from '@/main/crdPages/space/callout/CalloutListConnector';
import { VC_KNOWLEDGE_BASE_CALLOUT_RESTRICTIONS } from '@/main/crdPages/space/callout/calloutRestrictions';
import { useVcKnowledgeBaseData } from './useVcKnowledgeBaseData';

/**
 * CRD Knowledge Base page for a Virtual Contributor (`/vc/:nameId/knowledge-base`).
 * Replaces the legacy MUI `KnowledgeBaseDialog`/route. The knowledge body reuses
 * the CRD callouts feed (`CalloutListConnector`) rather than the MUI
 * `CalloutsGroupView`, keeping the page fully in the new design.
 *
 * Authorized viewers can add a callout via the header "Add" button, which opens
 * the shared CRD `CalloutFormConnector`. The connector's outer wrapper only
 * mounts a *space*-scoped storage provider, and this route resolves a VC (not a
 * space) — so we mount a VC-scoped `StorageConfigContextProvider` here for the
 * create-mode markdown/reference uploads (temporary location; the server
 * relocates the files onto the new callout on save).
 */
export const CrdVCKnowledgeBasePage = () => {
  const {
    vcId,
    viewProps,
    canEditDescription,
    onSaveDescription,
    callouts,
    calloutsSetId,
    canCreateCallout,
    canReorder,
    calloutsLoading,
  } = useVcKnowledgeBaseData();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <MarkdownUploadScope
        storage={vcId ? { locationType: 'virtualContributor', virtualContributorId: vcId } : undefined}
      >
        {markdownUpload => (
          <VCKnowledgeBaseView
            {...viewProps}
            canEditDescription={canEditDescription}
            onSaveDescription={onSaveDescription}
            descriptionMaxLength={LONG_MARKDOWN_TEXT_LENGTH}
            descriptionUpload={markdownUpload}
            canAddCallout={canCreateCallout}
            onAddCallout={() => setCreateOpen(true)}
            calloutsSlot={
              <CalloutListConnector
                callouts={callouts}
                calloutsSetId={calloutsSetId}
                canReorder={canReorder}
                loading={calloutsLoading}
              />
            }
          />
        )}
      </MarkdownUploadScope>

      {canCreateCallout && vcId && (
        <StorageConfigContextProvider
          locationType="virtualContributor"
          virtualContributorId={vcId}
          temporaryLocation={true}
          skip={!createOpen}
        >
          <CalloutFormConnector
            open={createOpen}
            onOpenChange={setCreateOpen}
            calloutsSetId={calloutsSetId}
            restrictions={VC_KNOWLEDGE_BASE_CALLOUT_RESTRICTIONS}
          />
        </StorageConfigContextProvider>
      )}
    </>
  );
};

export default CrdVCKnowledgeBasePage;
