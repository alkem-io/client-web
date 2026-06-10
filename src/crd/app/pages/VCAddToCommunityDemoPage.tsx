import { useState } from 'react';
import { VirtualContributorInviteDialog } from '@/crd/components/community/VirtualContributorInviteDialog';
import type { VcPreviewData } from '@/crd/components/virtualContributor/community/VirtualContributorPreview.types';
import { Button } from '@/crd/primitives/button';
import { MOCK_ACCOUNT_VCS, MOCK_LIBRARY_VCS, MOCK_VC_PREVIEWS } from '../data/virtualContributors';

/**
 * Demo: add an existing Virtual Contributor to a community. Opens the
 * `VirtualContributorInviteDialog`, which routes a selected VC through the
 * `VirtualContributorPreview` detail step before the (no-op) add/invite. The
 * search field and preview fetch are simulated against mock data.
 */
export function VCAddToCommunityDemoPage() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewData, setPreviewData] = useState<VcPreviewData | undefined>(undefined);
  const [previewLoading, setPreviewLoading] = useState(false);

  const matches = (name: string) => name.toLowerCase().includes(searchQuery.trim().toLowerCase());
  const accountVcs = MOCK_ACCOUNT_VCS.filter(vc => matches(vc.displayName));
  const libraryVcs = MOCK_LIBRARY_VCS.filter(vc => matches(vc.displayName));

  const loadPreview = (id: string) => {
    setPreviewData(undefined);
    setPreviewLoading(true);
    setTimeout(() => {
      setPreviewData(MOCK_VC_PREVIEWS[id]);
      setPreviewLoading(false);
    }, 500);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-6">
      <h1 className="text-page-title">Add a Virtual Contributor</h1>
      <p className="text-body text-muted-foreground">
        Open the invite dialog, search, select a Virtual Contributor to preview it, then add (account) or invite
        (library).
      </p>
      <Button type="button" className="self-start" onClick={() => setOpen(true)}>
        Add Virtual Contributor
      </Button>

      <VirtualContributorInviteDialog
        open={open}
        onOpenChange={setOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        accountVcs={accountVcs}
        libraryVcs={libraryVcs}
        onAddAccountVc={id => {
          console.log('Demo: add account VC', id);
          setOpen(false);
        }}
        onInviteLibraryVc={(id, message) => {
          console.log('Demo: invite library VC', id, message);
          setOpen(false);
        }}
        previewData={previewData}
        previewLoading={previewLoading}
        onPreview={loadPreview}
        onClosePreview={() => {
          setPreviewData(undefined);
          setPreviewLoading(false);
        }}
      />
    </div>
  );
}
