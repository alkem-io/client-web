import { useState } from 'react';
import { VCKnowledgeBaseView } from '@/crd/components/virtualContributor/knowledgeBase/VCKnowledgeBaseView';
import { Button } from '@/crd/primitives/button';
import { MOCK_KB } from '../data/virtualContributors';

const MOCK_CALLOUTS = [
  { id: 'c1', title: 'City-scale energy demand', body: 'Aggregated demand curves for 12 European cities.' },
  { id: 'c2', title: 'Microgrid topologies', body: 'Reference designs for islanded and grid-tied microgrids.' },
  { id: 'c3', title: 'Storage cost models', body: 'Battery + thermal storage cost projections through 2035.' },
];

/**
 * Demo: full-page CRD VC Knowledge Base view. A local toolbar toggles the
 * populated/empty state and the authorized-refresh affordance so designers can
 * preview every variant against mock data.
 */
export function VCKnowledgeBaseDemoPage() {
  const [isEmpty, setIsEmpty] = useState(false);
  const [canRefresh, setCanRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const calloutsSlot = (
    <ul className="flex flex-col gap-3" role="list">
      {MOCK_CALLOUTS.map(callout => (
        <li key={callout.id} className="rounded-lg border bg-card p-4">
          <h3 className="text-subsection-title">{callout.title}</h3>
          <p className="mt-1 text-body text-muted-foreground">{callout.body}</p>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="mx-auto flex w-full max-w-4xl flex-wrap gap-2 px-4 pt-4 md:px-6">
        <Button type="button" variant="outline" size="sm" onClick={() => setIsEmpty(prev => !prev)}>
          {isEmpty ? 'Show populated' : 'Show empty'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setCanRefresh(prev => !prev)}>
          {canRefresh ? 'Hide refresh (read-only)' : 'Show refresh (authorized)'}
        </Button>
      </div>

      <VCKnowledgeBaseView
        loading={false}
        noAccess={false}
        displayName={MOCK_KB.displayName}
        avatarColor={MOCK_KB.avatarColor}
        description={MOCK_KB.description}
        refresh={{
          canRefresh,
          lastUpdatedValue: MOCK_KB.lastUpdatedValue,
          refreshing,
          onRefresh: () => {
            console.log('Demo: refresh body of knowledge');
            setRefreshing(true);
            setTimeout(() => setRefreshing(false), 1200);
          },
        }}
        calloutsSlot={calloutsSlot}
        isEmpty={isEmpty}
      />
    </div>
  );
}
