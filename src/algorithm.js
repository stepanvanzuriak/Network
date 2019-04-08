const calculate = (values, startPoint) => {
  const { edges, nodes } = values;

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

    const [minCost, next] = possiblePaths.reduce(findMinCost, [Number.MAX_SAFE_INTEGER]);

    if (next) {
      prices[next] = minCost;
      visited.push(next);
    } else {
      break;
    }
  }

  return {
    edges,
    nodes: nodes.map(node => ({
      ...node,
      label: prices[node.label] ? `${node.label}(${prices[node.label]})` : node.label
    })),
    update: true
  };
};

export default calculate;
