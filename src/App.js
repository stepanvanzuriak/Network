import React, { useState } from 'react';
import ReactTable from 'react-table';
import withFixedColumns from 'react-table-hoc-fixed-columns';
import Graph from 'react-graph-vis';

import calculate from './algorithm';
import locale from './locale.json';

import './App.css';

const options = {
  layout: {
    hierarchical: false
  },

  autoResize: true,
  edges: {
    color: '#000000',

    smooth: {
      type: 'cubicBezier'
    }
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
  const [startPoint, setStartPoint] = useState(0);
  const [columns, setColumns] = useState([]);
  const [firstData, setFirstData] = useState([]);
  const [inputsList, setInputsList] = useState([]);
  const [mutValues, setMutValues] = useState({ nodes: [], edges: [], update: false });

  const values = { nodes: [], edges: [] };
  const columnsLength = columns.length;
  const showTable = Boolean(columnsLength);

  inputsList.forEach(row =>
    row
      .filter(({ value }) => value)
      .forEach(({ id, value }) => {
        const [start, end] = id.split('/');
        const startElement = { id: start, label: start };
        const endElement = { id: end, label: end };

        if (start === end) {
          values.nodes.push(startElement);
        } else {
          if (!values.nodes.some(({ id: eID }) => eID === startElement.id)) {
            values.nodes.push(startElement);
          }

          if (!values.nodes.some(({ id: eID }) => eID === endElement.id)) {
            values.nodes.push(endElement);
          }
        }

        values.edges.push({ from: start, to: end, label: value });
      })
  );

  const changeCount = ({ target: { value: inputValue } }) => {
    const value = Number(inputValue);

    // TODO: ADD SOME WARNING ABOUT POSSIBLE BROWSER FREEZE
    if (value < 100) {
      if (value > columnsLength) {
        const diff = value - columnsLength;
        const dataDiff = value - firstData.length;
        const valueArray = new Array(value).fill(null);

        setFirstData(
          addToArray(firstData, dataDiff).map((_, index) => {
            const result = {};

            valueArray.forEach((__, i) => {
              const id = `${index + 1}/${i + 1}`;
              result[i + 1] = (
                <input
                  id={id}
                  onChange={({ target: { value: edgeValue } }) =>
                    handleInputChange(index, i, edgeValue, id)
                  }
                />
              );
            });

            result['0'] = index + 1;

            return result;
          })
        );

        setColumns(
          fixedFirst(
            addToArray(columns, diff + 1, index => ({
              Header: `${columnsLength + index}`,
              accessor: `${columnsLength + index}`,
              style: { textAlign: 'center' }
            }))
          )
        );
      } else {
        setColumns(columns.slice(0, value + 1));
        setFirstData(firstData.slice(0, value));
      }
    }

    setCount(inputValue);
    setInputsList(createMatrix(Number(inputValue)));
  };

  const handleInputChange = (row, cell, value, id) => {
    setInputsList(list => {
      const element = list[row][cell];
      element.value = value;
      element.id = id;

      return [...list];
    });
  };

  const changeStartPoint = ({ target: { value } }) => setStartPoint(Number(value));

  const startAlgorithm = () => {
    setMutValues(calculate(values, startPoint));
  };

  const visValues = mutValues.update ? mutValues : values;

  return (
    <div className="App">
      <div>
        <span>{locale.PointsCount}:</span>
        <input value={count} onChange={changeCount} />
      </div>
      <div>
        <span>{locale.StartPoint}:</span>
        <input value={startPoint} onChange={changeStartPoint} />
        <button disabled={!startPoint} type="button" onClick={startAlgorithm}>
          {locale.StartVisualization}
        </button>
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

          <Graph graph={visValues} options={options} />
        </>
      )}
    </div>
  );
};

export default App;
