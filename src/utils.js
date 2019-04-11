export const addToArray = (array, size, func = value => value) => {
  const resultArray = [...array];
  for (let i = 0; i < size; i++) {
    resultArray.push(func(i));
  }

  return resultArray;
};

export const createMatrix = size => {
  const matrix = [];
  for (let i = 0; i < size; i++) {
    matrix[i] = [];
    for (let j = 0; j < size; j++) {
      matrix[i][j] = {};
    }
  }
  return matrix;
};

export const fixedFirst = array => {
  const resultArray = [...array];
  resultArray[0].fixed = 'left';
  resultArray[0].Header = '';

  return resultArray;
};

export const createFileFormat = (values, startPoint, nodeCount) => {
  const file = { startPoint, nodeCount, nodes: [], edges: [] };

  values.nodes.forEach(({ id, label }) => file.nodes.push({ id, label }));

  values.edges.forEach(({ from, to, label, color, arrows }) => {
    const result = {
      from,
      to,
      value: label,

      arrows
    };
    if (color) {
      result.color = color;
    }

    if (arrows) {
      result.arrows = arrows;
    }

    file.edges.push(result);
  });

  return file;
};
