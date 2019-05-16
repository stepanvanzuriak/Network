/* eslint-disable  */
function bfs(rGraph, s, t, parent) {
  const visited = [];
  const queue = [];
  const V = rGraph.length;
  // Create a visited array and mark all vertices as not visited
  for (let i = 0; i < V; i++) {
    visited[i] = false;
  }
  // Create a queue, enqueue source vertex and mark source vertex as visited
  queue.push(s);
  visited[s] = true;
  // eslint-disable-next-line no-param-reassign
  parent[s] = -1;

  while (queue.length != 0) {
    const u = queue.shift();
    // console.log('Current', u + 1);
    for (let v = 0; v < V; v++) {
      if (visited[v] == false && rGraph[u][v] > 0) {
        // console.log('PUSH', v + 1);
        queue.push(v);
        // eslint-disable-next-line no-param-reassign
        parent[v] = u;
        visited[v] = true;
      }
    }
  }
  // If we reached sink in BFS starting from source, then return true, else false
  return visited[t] == true;
}

function calculate(values) {
  /* Create a residual graph and fill the residual graph
	 with given capacities in the original graph as
	 residual capacities in residual graph

	 Residual graph where rGraph[i][j] indicates
	 residual capacity of edge from i to j (if there
	 is an edge. If rGraph[i][j] is 0, then there is
	 not)
  */
  console.log('values', values);

  const newEdges = [];
  let positiveSum = 0;
  let negatieSum = 0;

  values.nodes.forEach(val => {
    if (!isNaN(Number(val.label))) {
      if (Number(val.label) > 0) {
        newEdges.push({ from: 'S', to: val.id, label: `${Math.abs(Number(val.label))}` });
      } else {
        newEdges.push({ from: val.id, to: 'T', label: `${Math.abs(Number(val.label))}` });
      }
    }
  });

  const oldNodesLength = values.nodes.length + 1;

  if (!values.nodes.some(({ id }) => id === 'S')) {
    values.nodes.push({ id: 'S', label: 'S' });
    values.nodes.push({ id: 'T', label: 'T' });
  }

  values.edges = [...values.edges, ...newEdges];

  const graph = [];

  for (let i = 0; i < values.nodes.length; i++) {
    const tmp = [];

    for (let j = 0; j < values.nodes.length; j++) {
      tmp.push(0);
    }

    graph.push(tmp);
  }

  values.edges.forEach(val => {
    const { from, to } = val;
    let x = Number(from);
    let y = Number(to);

    if (isNaN(x)) {
      if (from === 'S') {
        x = 0;
      } else {
        x = oldNodesLength;
      }
    }

    if (isNaN(y)) {
      if (to === 'S') {
        y = 0;
      } else {
        y = oldNodesLength;
      }
    }

    graph[x][y] = Number(val.label);
  });

  console.log(graph);

  const s = 0;
  const t = oldNodesLength;
  if (s < 0 || t < 0 || s > graph.length - 1 || t > graph.length - 1) {
    throw new Error('Ford-Fulkerson-Maximum-Flow :: invalid sink or source');
  }
  if (graph.length === 0) {
    throw new Error('Ford-Fulkerson-Maximum-Flow :: invalid graph');
  }
  const rGraph = [];
  const dGraph = [];
  for (let u = 0; u < graph.length; u++) {
    const temp = [];
    const temp2 = [];
    if (graph[u].length !== graph.length) {
      throw new Error('Ford-Fulkerson-Maximum-Flow :: invalid graph. graph needs to be NxN');
    }
    for (let v = 0; v < graph.length; v++) {
      temp.push(graph[u][v]);
      temp2.push('');
    }
    rGraph.push(temp);
    dGraph.push(temp2);
  }

  const parent = [];
  let maxFlow = 0;

  while (bfs(rGraph, s, t, parent)) {
    let pathFlow = Number.MAX_VALUE;
    for (let v = t; v != s; v = parent[v]) {
      const u = parent[v];

      pathFlow = Math.min(pathFlow, rGraph[u][v]);
    }
    const updated = [];
    for (let v = t; v != s; v = parent[v]) {
      const u = parent[v];

      rGraph[u][v] -= pathFlow;
      rGraph[v][u] += pathFlow;

      dGraph[u][v] += `+${pathFlow}`;
      updated.push([u, v]);
      // dGraph[u][v] += `+${pathFlow}`;
    }

    maxFlow += pathFlow;

    console.log(updated.reverse(), pathFlow);
  }

  console.log(graph);
  // Return the overall flow

  values.nodes.forEach(e => {
    if (!isNaN(Number(e.label))) {
      if (Number(e.label) > 0) {
        console.log(Number(e.label));
        positiveSum += Number(e.label);
      } else {
        console.log(Number(e.label));
        negatieSum += Number(e.label);
      }
    }
  });

  values.edges = values.edges.map(val => {
    const { from, to } = val;
    let x = Number(from);
    let y = Number(to);

    if (isNaN(x)) {
      if (from === 'S') {
        x = 0;
      } else {
        x = oldNodesLength;
      }
    }

    if (isNaN(y)) {
      if (to === 'S') {
        y = 0;
      } else {
        y = oldNodesLength;
      }
    }
    const extraData = dGraph[x][y];
    if (extraData.length !== 0) {
      values.nodes = values.nodes.map(v => {
        const { id } = v;

        if (Number(id) === x || Number(id) === y || v.id === 'T' || v.id === 'S') {
          if (v.id === 'T') {
            console.log(negatieSum);
            return { ...v, color: { background: 'red' }, label: `${'T'} ${negatieSum}` };
          }
          if (v.id === 'S') {
            return { ...v, color: { background: 'red' }, label: `${'S'} ${positiveSum}` };
          }

          console.log(positiveSum);
          return { ...v, color: { background: 'red' } };
        }

        return { ...v };
      });
    }
    if (Number(val.label) === eval(extraData)) {
      return { ...val, label: `(${val.label}) ${extraData}`, color: { color: 'green' }, width: 3 };
    }
    return { ...val, label: `(${val.label}) ${extraData}` };
  });

  console.log(values.nodes, maxFlow);

  return [values, maxFlow];
}

const graph = [
  [0, 0, 12, 17, 0, 0, 13, 31, 0, 0, 19, 18, 0],
  [0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0, 35],
  [0, 7, 0, 22, 13, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 17, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 5, 0, 0, 0, 10, 0, 23, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 37],
  [0, 0, 0, 0, 0, 2, 0, 19, 0, 11, 0, 31, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 5, 9, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 38],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 12, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

// console.log(`The maximum possible flow is ${calculate(graph, 0, 12)}`);

export default calculate;
