import { describe, expect, it } from 'vitest';
import type { PromptGraph } from '@/core/apollo/generated/graphql-schema';
import { mapNodesToPromptGraph, mapPromptGraphToNodes } from '../vcSettingsMapper';

// Minimal graph: START → analyze (user) → END, plus a system node.
const graph = {
  start: 'START',
  end: 'END',
  edges: [
    { from: 'START', to: 'analyze' },
    { from: 'analyze', to: 'END' },
  ],
  nodes: [
    { name: 'START', system: true, input_variables: [], prompt: '', output: null },
    {
      name: 'analyze',
      system: false,
      input_variables: ['topic'],
      prompt: 'Analyze {topic}',
      output: {
        title: 'FunctionOutput',
        type: 'object',
        properties: [{ name: 'summary', type: 'string', optional: false, description: 'A summary' }],
      },
    },
    { name: 'END', system: true, input_variables: [], prompt: '', output: null },
  ],
} as unknown as PromptGraph;

describe('mapPromptGraphToNodes', () => {
  it('returns ordered nodes including the read-only START/END terminals', () => {
    const nodes = mapPromptGraphToNodes(graph);
    expect(nodes.map(n => n.name)).toEqual(['START', 'analyze', 'END']);
    // Terminals are read-only (system); the user node is editable.
    expect(nodes.find(n => n.name === 'START')?.system).toBe(true);
    expect(nodes.find(n => n.name === 'END')?.system).toBe(true);
    // biome-ignore lint/style/noNonNullAssertion: asserted present above
    const analyze = nodes.find(n => n.name === 'analyze')!;
    expect(analyze.system).toBe(false);
    expect(analyze.inputVariables).toEqual(['topic']);
    expect(analyze.prompt).toBe('Analyze {topic}');
    expect(analyze.outputProperties).toEqual([
      { name: 'summary', type: 'string', optional: false, description: 'A summary' },
    ]);
  });

  it('returns an empty list for a missing/empty graph', () => {
    expect(mapPromptGraphToNodes(undefined)).toEqual([]);
    expect(mapPromptGraphToNodes(null)).toEqual([]);
    expect(mapPromptGraphToNodes({ nodes: [], edges: [] } as unknown as PromptGraph)).toEqual([]);
  });
});

describe('mapNodesToPromptGraph', () => {
  it('rebuilds the user node from edits while preserving edges', () => {
    const edited = mapPromptGraphToNodes(graph).map(n =>
      n.name === 'analyze' ? { ...n, prompt: 'Summarize {topic}' } : n
    );
    const result = mapNodesToPromptGraph(edited, graph);

    // edges preserved from the original graph
    expect(result.edges).toEqual(graph.edges);
    // the analyze node prompt is updated
    const analyze = result.nodes.find(n => n.name === 'analyze');
    expect(analyze?.prompt).toBe('Summarize {topic}');
    expect(analyze?.output?.properties).toHaveLength(1);
  });

  it('preserves the START/END terminal nodes verbatim through the save round-trip', () => {
    const edited = mapPromptGraphToNodes(graph).map(n =>
      n.name === 'analyze' ? { ...n, prompt: 'Summarize {topic}' } : n
    );
    const result = mapNodesToPromptGraph(edited, graph);

    // START and END are read-only terminals — they must survive the round-trip
    // (otherwise the edges START → analyze → END reference missing nodes) and are
    // kept verbatim from the original graph rather than rebuilt from the CRD shape.
    expect(result.nodes.map(n => n.name)).toEqual(['START', 'analyze', 'END']);
    expect(result.nodes.find(n => n.name === 'START')).toBe(graph.nodes?.[0]);
    expect(result.nodes.find(n => n.name === 'END')).toBe(graph.nodes?.[2]);
  });

  it('yields an empty nodes array for a null original graph', () => {
    // A null promptGraph produces no editable nodes (see mapPromptGraphToNodes),
    // so the round-trip is empty rather than fabricating nodes with no topology.
    const editable = mapPromptGraphToNodes(null);
    const result = mapNodesToPromptGraph(editable, null);
    expect(result.nodes).toEqual([]);
  });
});
