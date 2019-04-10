const calculate = (values, startPoint) => {
  const { edges, nodes } = values;
  let resEdges = edges;

  const visited = [String(startPoint)];
  const prices = {
    [String(startPoint)]: 0
  };

  const findMinCost = (acc, e) => {
    const { from, to, label } = e;
    const next = to;
    const [min] = acc;

    if (min >= prices[from] + Number(label)) {
      return [prices[from] + Number(label), next, from];
    }

    return acc;
  };

  const findPath = ({ from, to }) => visited.includes(from) && !visited.includes(to);

  while (visited.length < nodes.length) {
    const possiblePaths = edges.filter(findPath);

    const [minCost, next, from] = possiblePaths.reduce(findMinCost, [Number.MAX_SAFE_INTEGER]);

    if (next) {
      prices[next] = minCost;

      resEdges = resEdges.map(e => {
        const { from: f, to } = e;
        if (f === from && to === next) {
          return {
            ...e,
            color: {
              color: 'red',
              highlight: 'red'
            },
            arrows: {
              to: { enabled: true, scaleFactor: 1, type: 'arrow' }
            }
          };
        }

        return e;
      });

      visited.push(next);
    } else {
      break;
    }
  }

  return {
    edges: resEdges,
    nodes: nodes.map(node => ({
      ...node,
      label: prices[node.label] ? `${node.label}(${prices[node.label]})` : node.label
    }))
  };
};

export default calculate;
