import React, { useState } from 'react';
import ReactTable from 'react-table';
import withFixedColumns from 'react-table-hoc-fixed-columns';
import Graph from 'react-graph-vis';

import locale from './locale.json';

import './App.css';

const options = {
  layout: {
    hierarchical: false
  },
  edges: {
    color: '#000000'
  },
  height: '500px'
};

const addToArray = (array, size, func = value => value) => {
  const resultArray = [...array];
  for (let i = 0; i < size; i++) {
    resultArray.push(func(i));
  }

  return resultArray;
};

const createMatrix = size => {
  const matrix = [];
  for (let i = 0; i < size; i++) {
    matrix[i] = [];
    for (let j = 0; j < size; j++) {
      matrix[i][j] = {};
    }
  }
  return matrix;
};

const fixedFirst = array => {
  const resultArray = [...array];
  resultArray[0].fixed = 'left';
  resultArray[0].Header = '';

  return resultArray;
};

const ReactTableFixedColumns = withFixedColumns(ReactTable);

const App = () => {
  const [count, setCount] = useState(0);
  const [columns, setColumns] = useState([]);
  const [firstData, setFirstData] = useState([]);
  const [inputsList, setInputsList] = useState([]);

  const values = { nodes: [], edges: [] };

  inputsList.map(e =>
    e
      .filter(({ value }) => value)
      .map(({ id, value }) => {
        const [start, end] = id.split('/');

        values.nodes.push({ id: start, label: start });
        values.nodes.push({ id: end, label: end });
        values.edges.push({ from: start, to: end, label: value });
      })
  );

  const columnsLength = columns.length;
  const showTable = Boolean(columnsLength);

  const changeCount = e => {
    const value = Number(e.target.value) + 1;
    setCount(e.target.value);

    setInputsList(createMatrix(+e.target.value));

    // TODO: ADD SOME WARNING ABOUT POSIBLE BROWSER FREEZE
    if (value < 100) {
      if (value > columnsLength) {
        const diff = value - columnsLength;
        const valueArray = new Array(value).fill(null);

        setColumns(
          fixedFirst(
            addToArray(columns, diff, index => ({
              Header: `${columnsLength + index}`,
              accessor: `${columnsLength + index}`,
              style: { textAlign: 'center' }
            }))
          )
        );
        setFirstData(
          addToArray(firstData, diff - 1).map((row, index) => {
            const result = {};

            valueArray.forEach((_, i) => {
              const id = `${index + 1}/${i + 1}`;
              result[i + 1] = (
                <input
                  id={id}
                  onChange={event => handleInputChange(index, i, event.target.value, id)}
                />
              );
            });

            result['0'] = index + 1;

            return result;
          })
        );
      } else {
        setColumns(columns.slice(0, value));
        setFirstData(firstData.slice(0, value));
      }
    }
  };

  const handleInputChange = (row, cell, value, id) => {
    setInputsList(list => {
      const element = list[row][cell];
      element.value = value;
      element.id = id;

      return [...list];
    });
  };

  return (
    <div className="App">
      <div>
        <span>{locale.PointsCount}:</span>
        <input value={count} onChange={changeCount} />
      </div>
      {showTable && (
        <>
          <ReactTableFixedColumns
            minRows={1}
            data={firstData}
            columns={columns}
            defaultPageSize={10}
            className="-striped"
          />

          <Graph graph={values} options={options} />
        </>
      )}
    </div>
  );
};

export default App;
