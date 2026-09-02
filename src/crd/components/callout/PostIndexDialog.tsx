import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Skeleton } from '@/crd/primitives/skeleton';
import { type CalloutListItem, CalloutListView } from './CalloutListView';

type PostIndexDialogLabels = {
  /** Dialog heading, e.g. "Post Index". */
  title: string;
  /** Accessible label announced while the index is loading. */
  loadingLabel: string;
  /** Shown when the index resolves to zero posts. */
  empty: string;
};

type PostIndexDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The full post index, already mapped + sorted by the consumer. */
  items: CalloutListItem[];
  /** True while the lazy index query is in flight — renders skeleton rows. */
  loading: boolean;
  closeLabel: string;
  labels: PostIndexDialogLabels;
  onItemClick?: (id: string) => void;
};

/** Placeholder rows shown while the index loads — enough to fill the fixed
 *  two-column body so the dialog never visibly resizes when data arrives. */
const SKELETON_ROWS = 18;

/**
 * Read-only dialog listing every post in a flow state. The list query is fired
 * lazily by the consumer when the dialog opens (feature 007), so the rows start
 * as skeleton placeholders and swap to the real list once it resolves.
 *
 * Purely presentational: data + behaviour arrive via props (CRD golden rules),
 * and — being a transient picker-style view with nothing the user authored —
 * it intentionally closes without a discard-confirm guard.
 */
export function PostIndexDialog({
  open,
  onOpenChange,
  items,
  loading,
  closeLabel,
  labels,
  onItemClick,
}: PostIndexDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Fixed size: the body height is locked to the viewport so the dialog
          stays the same size whether it shows skeletons, a short list, or a
          long scrolling one. */}
      <DialogContent
        className="sm:max-w-2xl w-[calc(100vw-2rem)] h-[75vh] flex flex-col overflow-hidden"
        closeLabel={closeLabel}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>{labels.title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {loading ? (
            <output aria-label={labels.loadingLabel} className="block">
              {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
              {/* biome-ignore lint/a11y/useSemanticElements: role="list" restores semantics after Tailwind reset */}
              <ul role="list" className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0.5 list-none p-0 m-0">
                {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder list
                  <li key={index} className="flex items-center gap-2.5 px-3 py-2">
                    <Skeleton className="w-4 h-4 shrink-0 rounded" />
                    <Skeleton className="h-4 flex-1" />
                  </li>
                ))}
              </ul>
            </output>
          ) : items.length > 0 ? (
            <CalloutListView items={items} onItemClick={onItemClick} />
          ) : (
            <p className="text-body text-muted-foreground h-full grid place-items-center px-3 text-center">
              {labels.empty}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
