/* eslint-disable  */
function bfs(rGraph, s, t, parent) {
  let visited = [];
  let queue = [];
  let V = rGraph.length;
  // Create a visited array and mark all vertices as not visited
  for (let i = 0; i < V; i++) {
    visited[i] = false;
  }
  // Create a queue, enqueue source vertex and mark source vertex as visited
  queue.push(s);
  visited[s] = true;
  parent[s] = -1;

  while (queue.length != 0) {
    let u = queue.shift();
    //console.log('Current', u + 1);
    for (let v = 0; v < V; v++) {
      if (visited[v] == false && rGraph[u][v] > 0) {
        //console.log('PUSH', v + 1);
        queue.push(v);
        parent[v] = u;
        visited[v] = true;
      }
    }
  }
  // If we reached sink in BFS starting from source, then return true, else false
  return visited[t] == true;
}

function calculate(graph, s, t) {
  /* Create a residual graph and fill the residual graph
	 with given capacities in the original graph as
	 residual capacities in residual graph

	 Residual graph where rGraph[i][j] indicates
	 residual capacity of edge from i to j (if there
	 is an edge. If rGraph[i][j] is 0, then there is
	 not)
	*/
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
      let u = parent[v];
      console.log('2122', v + 1, u + 1, pathFlow, rGraph[u][v], parent.map(v => v + 1));
      pathFlow = Math.min(pathFlow, rGraph[u][v]);
    }
    for (let v = t; v != s; v = parent[v]) {
      let u = parent[v];
      console.log('asdasd', v + 1, u + 1, pathFlow);
      rGraph[u][v] -= pathFlow;
      rGraph[v][u] += pathFlow;

      dGraph[u][v] += `-${pathFlow}`;
      dGraph[u][v] += `+${pathFlow}`;
    }

    maxFlow += pathFlow;

    console.log(parent, s, t);
    console.log();
    console.log(rGraph);
  }

  console.log(dGraph);
  // Return the overall flow
  return maxFlow;
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

console.log('The maximum possible flow is ' + calculate(graph, 0, 12));

// export default calculate;
