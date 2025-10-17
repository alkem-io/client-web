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
