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
  it('returns only the editable user nodes (terminals dropped) with computed available variables', () => {
    const nodes = mapPromptGraphToNodes(graph);
    expect(nodes.map(n => n.name)).toEqual(['analyze']);
    const analyze = nodes[0];
    expect(analyze.system).toBe(false);
    expect(analyze.inputVariables).toEqual(['topic']);
    // First user node sees the base START variables (START has no output props here).
    expect(analyze.availableInputVariables).toEqual(['conversation', 'display_name', 'description']);
    expect(analyze.prompt).toBe('Analyze {topic}');
    expect(analyze.outputProperties).toEqual([
      { name: 'summary', type: 'string', optional: false, description: 'A summary' },
    ]);
  });

  it('accumulates upstream output properties into availableInputVariables', () => {
    const g = {
      edges: [
        { from: 'START', to: 'a' },
        { from: 'a', to: 'b' },
        { from: 'b', to: 'END' },
      ],
      nodes: [
        {
          name: 'START',
          system: true,
          input_variables: [],
          prompt: '',
          output: { properties: [{ name: 'seed', type: 'string', optional: false, description: '' }] },
        },
        {
          name: 'a',
          system: false,
          input_variables: [],
          prompt: '',
          output: { properties: [{ name: 'fromA', type: 'string', optional: false, description: '' }] },
        },
        { name: 'b', system: false, input_variables: [], prompt: '', output: { properties: [] } },
        { name: 'END', system: true, input_variables: [], prompt: '', output: null },
      ],
    } as unknown as PromptGraph;

    const nodes = mapPromptGraphToNodes(g);
    expect(nodes.map(n => n.name)).toEqual(['a', 'b']);
    // `a` sees base + START's output; `b` additionally sees `a`'s output.
    expect(nodes[0].availableInputVariables).toEqual(['conversation', 'display_name', 'description', 'seed']);
    expect(nodes[1].availableInputVariables).toEqual(['conversation', 'display_name', 'description', 'seed', 'fromA']);
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
