import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PostIndexDialog } from '@/crd/components/callout/PostIndexDialog';
import type { ClassificationTagsetModel } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.model';
import { orderedStages, treePosts, useSpaceTree } from '@/domain/space/hooks/useSpacePage';
import { useNativeRouteSpace } from '@/main/routing/urlResolver/native/useNativeRouteSpace';
import { mapPostIndexRowsToListItems } from '../dataMappers/postIndexDataMapper';
import { CrdCalloutDialogById } from './CrdCalloutDialogById';

type PostIndexDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calloutsSetId: string | undefined;
  classificationTagsets: ClassificationTagsetModel[];
  /** Section number used to build each post's deep link (`?tab=N`) for the
   *  native href — middle-click / open-in-new-tab still works. */
  tabSectionNumber: number;
};

/**
 * Wires the lazy Post Index query (feature 007) to the presentational dialog.
 * The query is fired only when the dialog opens — the heavy per-post metadata is
 * never fetched on tab load, only on demand here.
 *
 * Clicking a row opens the callout detail dialog **in place** (like the feed),
 * not by navigating to the callout's own route — navigation remounts the whole
 * tabbed space page and refetches every tab. See {@link CrdCalloutDialogById}.
 */
export function PostIndexDialogConnector({
  open,
  onOpenChange,
  calloutsSetId,
  tabSectionNumber,
}: PostIndexDialogConnectorProps) {
  const { t } = useTranslation('crd-space');
  const [selectedCalloutId, setSelectedCalloutId] = useState<string | undefined>();

  // 021 D9: the space's post index is its own posts in the page's space tree (no request of its own), grouped by stage
  // here: the tab shows its own stage's rows, a space without stages all of them. While the server does not serve the
  // tree read yet the dialog says so in place.
  const { tree, notServed } = useSpaceTree(open ? calloutsSetId : undefined);
  const stageId = orderedStages(useNativeRouteSpace().space?.stages)[tabSectionNumber - 1]?.id;
  const rows = treePosts(tree).filter(row => !stageId || row.stage?.id === stageId);
  const items = mapPostIndexRowsToListItems(rows, tabSectionNumber, t);

  const isLoading = open && !tree && !notServed;

  return (
    <>
      <PostIndexDialog
        open={open}
        onOpenChange={onOpenChange}
        items={items}
        loading={isLoading}
        closeLabel={t('postIndexDialog.close')}
        labels={{
          title: t('sidebar.postIndex'),
          loadingLabel: t('postIndexDialog.loadingLabel'),
          empty: notServed ? t('tabs.unavailable') : t('postIndexDialog.empty'),
        }}
        onItemClick={setSelectedCalloutId}
      />

      {/* Opens in place once details load, then closes the index (no flash). */}
      <CrdCalloutDialogById
        calloutId={selectedCalloutId}
        calloutsSetId={calloutsSetId}
        onLoaded={() => onOpenChange(false)}
        onClose={() => setSelectedCalloutId(undefined)}
      />
    </>
  );
}
