import { useState } from 'react';
import { VirtualContributorBadge } from '@/crd/components/common/VirtualContributorBadge';
import { VCPromptGraphCard } from '@/crd/components/virtualContributor/settings/VCPromptGraphCard';
import type {
  SectionSaveStatus,
  VcPromptGraphNode,
  VcPromptGraphProperty,
} from '@/crd/components/virtualContributor/settings/VCPromptGraphCard.types';
import { MOCK_PROMPT_GRAPH_NODES } from '../data/virtualContributors';

const FIELD_FOOTER_LABELS = {
  save: 'Save',
  saving: 'Saving…',
  saved: 'Saved',
  retry: 'Retry',
};

/**
 * Demo: the advanced-config prompt-graph editor card (system nodes locked, user
 * nodes editable with prompt + output-property tables, Save/Reset with a
 * per-section save flash), plus a `VirtualContributorBadge` showcase row.
 */
export function VCAdminConfigDemoPage() {
  const [nodes, setNodes] = useState<VcPromptGraphNode[]>(MOCK_PROMPT_GRAPH_NODES);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<SectionSaveStatus>({ kind: 'idle' });
  const [editingEnabled, setEditingEnabled] = useState(true);

  const patchNode = (nodeName: string, patch: Partial<VcPromptGraphNode>) => {
    setNodes(prev => prev.map(node => (node.name === nodeName ? { ...node, ...patch } : node)));
    setDirty(true);
    setStatus({ kind: 'idle' });
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
      <section className="flex flex-col gap-3">
        <h1 className="text-page-title">Virtual Contributor badge</h1>
        <div className="flex items-center gap-4">
          <VirtualContributorBadge size="sm" />
          <VirtualContributorBadge size="md" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-section-title">Advanced configuration</h2>
        <VCPromptGraphCard
          nodes={nodes}
          onChangeNodePrompt={(nodeName, prompt) => patchNode(nodeName, { prompt })}
          onChangeNodeProperties={(nodeName, properties: VcPromptGraphProperty[]) =>
            patchNode(nodeName, { outputProperties: properties })
          }
          onSave={() => {
            console.log('Demo: save prompt graph', nodes);
            setStatus({ kind: 'saving' });
            setTimeout(() => {
              setDirty(false);
              setStatus({ kind: 'saved' });
              setTimeout(() => setStatus({ kind: 'idle' }), 1800);
            }, 800);
          }}
          onReset={() => {
            console.log('Demo: reset prompt graph');
            setNodes(MOCK_PROMPT_GRAPH_NODES);
            setDirty(false);
            setStatus({ kind: 'idle' });
          }}
          dirty={dirty}
          status={status}
          editingEnabled={editingEnabled}
          canTogglePlatformSetting={true}
          onToggleEditingEnabled={setEditingEnabled}
          labels={FIELD_FOOTER_LABELS}
        />
      </section>
    </div>
  );
}
