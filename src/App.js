import React, { useState, useEffect } from 'react';
import ReactTable from 'react-table';
import withFixedColumns from 'react-table-hoc-fixed-columns';

import locale from './locale.json';

import './App.css';

const addToArray = (array, size, func = value => value) => {
  const resultArray = [...array];
  for (let i = 0; i < size; i++) {
    resultArray.push(func(i));
  }

  return resultArray;
};

const fixedFirst = array => {
  const resultArray = [...array];
  resultArray[0].fixed = 'left';
  resultArray[0].Header = '';

  return resultArray;
};

const createInputsList = tableData => {
  const list = [];
  tableData.forEach(item => {
    list.push(
      Object.values(item)
        .filter(e => e.props)
        .map(({ props: { id, value } }) => ({ id, value }))
    );
  });
  return list;
};

const ReactTableFixedColumns = withFixedColumns(ReactTable);

const App = () => {
  const [count, setCount] = useState('');
  const [columns, setColumns] = useState([]);
  const [firstData, setFirstData] = useState([]);
  const [inputsList, setInputsList] = useState(null);

  useEffect(() => {
    /* 
        it`s a little bit a late time, so i can`t think clear and find the way to fix problem with
        losing out values in inputsList when we make our table bigger :(
      */
    const newInputsArr = createInputsList(firstData);
    setInputsList(newInputsArr);
  }, [count]);

  const columnsLength = columns.length;
  const showTable = Boolean(columnsLength);

  const changeCount = e => {
    const value = Number(e.target.value) + 1;
    setCount(e.target.value);
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
              result[i + 1] = (
                <input
                  id={`${index}/${i}`}
                  onChange={event => handleInputChange(index, i, event.target.value)}
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

  const handleInputChange = (row, cell, value) => {
    setInputsList(list => {
      const element = list[row][cell];
      element.value = value;
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
        <ReactTableFixedColumns
          minRows={1}
          data={firstData}
          columns={columns}
          defaultPageSize={10}
          className="-striped"
        />
      )}
    </div>
  );
};

export default App;
