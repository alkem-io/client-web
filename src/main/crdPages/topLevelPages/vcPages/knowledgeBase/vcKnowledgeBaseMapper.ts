import type { VcKnowledgeBaseViewProps } from '@/crd/components/virtualContributor/knowledgeBase/VCKnowledgeBaseView.types';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';

export type MapVcKnowledgeBaseInput = {
  loading: boolean;
  noAccess: boolean;
  vcId: string | undefined;
  displayName: string | undefined;
  avatarUrl: string | undefined;
  description: string | undefined;
  canRefresh: boolean;
  /** Pre-formatted last-ingestion date, or undefined when never run. */
  lastUpdatedValue: string | undefined;
  onRefresh: () => void;
  refreshing: boolean;
  calloutsCount: number;
};

/**
 * Maps Knowledge Base GraphQL/hook data to the pure CRD view props. The
 * `calloutsSlot` is injected by the page (it wires the CRD callouts feed).
 */
export const mapVcKnowledgeBaseToViewProps = (
  input: MapVcKnowledgeBaseInput
): Omit<VcKnowledgeBaseViewProps, 'calloutsSlot'> => ({
  loading: input.loading,
  noAccess: input.noAccess,
  displayName: input.displayName ?? '',
  avatarUrl: input.avatarUrl,
  avatarColor: pickColorFromId(input.vcId ?? 'vc'),
  description: input.description || undefined,
  refresh: {
    canRefresh: input.canRefresh,
    lastUpdatedValue: input.lastUpdatedValue,
    onRefresh: input.onRefresh,
    refreshing: input.refreshing,
  },
  isEmpty: input.calloutsCount === 0,
});
