import { FormNodeValue, PromptGraphNode } from './types';

export function transformNodeToPromptGraphNode(name: string, value: FormNodeValue) {
  // Ensure prompt is an array of strings. If it's a single string, split on newline to preserve lines

  let prompt = value.prompt;
  if (Array.isArray(prompt)) {
    prompt = prompt.join('\n');
  }

  const node: PromptGraphNode = {
    name,
    system: false,
    input_variables: value.input_variables || [],
    prompt,
  };

  if (value.output?.properties) {
    node.output = {
      title: 'FunctionOutput',
      type: 'object',
      properties: value.output.properties,
    };
  }

  return node;
}

export function transformNodesMapToArray(nodesMap: Record<string, FormNodeValue> | undefined) {
  if (!nodesMap) return [];
  return Object.entries(nodesMap).map(([name, value]) => transformNodeToPromptGraphNode(name, value));
}

export function extractVariablesFromText(text: string) {
  const vars: string[] = [];
  if (!text) return vars;
  const re = /\{\{.*?\}\}|\{([A-Za-z0-9_\\]+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m[1]) {
      vars.push(m[1].replaceAll('\\', ''));
    }
  }
  return Array.from(new Set(vars));
}

export const prepareGraph = (
  promptGraph: { nodes: any[]; edges: Array<{ from: string; to: string }> },
  startNodeName: string = 'START'
) => {
  // Build a simple lookup map: from -> to (O(n))
  const nextNode = new Map<string, string>();

  promptGraph.edges.forEach(edge => {
    nextNode.set(edge.from, edge.to);
  });

  // Build a lookup map for nodes by name (O(n))
  const nodesByName = new Map<string, any>();
  promptGraph.nodes.forEach(node => {
    if (node.name) {
      nodesByName.set(node.name, node);
    }
  });

  // Follow the single path from start to leaf (O(n))
  const path: any[] = [];
  let currentNodeName = startNodeName;

  while (currentNodeName) {
    const currentNode = nodesByName.get(currentNodeName);

    if (currentNode) {
      path.push(currentNode);
    }
    if (currentNodeName === 'END' || currentNodeName === 'START') {
      path.push(currentNodeName);
    }

    const next = nextNode.get(currentNodeName);

    if (!next) {
      // Reached a leaf node (no outgoing edge)
      break;
    }

    currentNodeName = next;
  }

  return path;
};
