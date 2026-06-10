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
  it('returns ordered editable nodes, dropping START/END terminals', () => {
    const nodes = mapPromptGraphToNodes(graph);
    expect(nodes.map(n => n.name)).toEqual(['analyze']);
    const analyze = nodes[0];
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
  it('rebuilds the nodes array from edits while preserving edges', () => {
    const edited = mapPromptGraphToNodes(graph).map(n => ({ ...n, prompt: 'Summarize {topic}' }));
    const result = mapNodesToPromptGraph(edited, graph);

    // edges preserved from the original graph
    expect(result.edges).toEqual(graph.edges);
    // the analyze node prompt is updated
    const analyze = result.nodes.find(n => n.name === 'analyze');
    expect(analyze?.prompt).toBe('Summarize {topic}');
    expect(analyze?.output?.properties).toHaveLength(1);
  });
});
