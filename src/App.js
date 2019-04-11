import React, { useState, useEffect } from 'react';
import ReactTable from 'react-table';
import withFixedColumns from 'react-table-hoc-fixed-columns';
import Graph from 'react-graph-vis';

import calculate from './algorithm';
import locale from './locale.json';

import './App.css';
import { addToArray, fixedFirst, createMatrix, createFileFormat } from './utils';

const options = {
  layout: {
    hierarchical: false,
    randomSeed: 42
  },
  autoResize: true,
  edges: {
    smooth: {
      type: 'cubicBezier'
    },
    arrows: {
      to: { enabled: false, scaleFactor: 1, type: 'arrow' },
      middle: { enabled: false, scaleFactor: 1, type: 'arrow' },
      from: { enabled: false, scaleFactor: 1, type: 'arrow' }
    }
  },
  height: '500px'
};

const fileReader = new FileReader();

const ReactTableFixedColumns = withFixedColumns(ReactTable);
let values = { nodes: [], edges: [] };

const App = () => {
  const [defaultTableData, setDefaultTableData] = useState({});
  const [file, setFileData] = useState({});
  const [count, setCount] = useState(0);
  const [startPoint, setStartPoint] = useState(0);
  const [columns, setColumns] = useState([]);
  const [firstData, setFirstData] = useState([]);
  const [inputsList, setInputsList] = useState([]);
  const [network, setNetwork] = useState(undefined);
  const [downFile, setDownFile] = useState(values);

  const columnsLength = columns.length;
  const showTable = Boolean(columnsLength);

  fileReader.onload = e => {
    setFileData(JSON.parse(e.target.result));
  };

  useEffect(() => {
    if (Object.keys(file).length) {
      setDefaultTableData(
        file.edges.reduce((acc, edge) => ({ ...acc, [`${edge.from}:${edge.to}`]: edge.value }), {})
      );
      values = { nodes: [], edges: [] };
    }
  }, [file]);

  useEffect(() => {
    if (Object.keys(file).length) {
      changeCount({ target: { value: file.nodes.length } });
      setStartPoint(file.startPoint);

      file.nodes.forEach(node => {
        if (typeof node === 'object') {
          if (!values.nodes.some(({ id }) => id === node.id)) {
            values.nodes.push({ id: node.id, label: node.label });
          }
        } else {
          // eslint-disable-next-line no-lonely-if
          if (!values.nodes.some(({ id }) => id === node)) {
            values.nodes.push({ id: node, label: node });
          }
        }
      });
      file.edges.forEach(edge => {
        if (!values.edges.some(({ from, to }) => from === edge.from && to === edge.to)) {
          values.edges.push({
            from: edge.from,
            to: edge.to,
            label: `${edge.value}`,
            color: edge.color,
            arrows: edge.arrows
          });
        } else {
          values.edges = values.edges.map(e => {
            const { from, to } = e;
            if (from === edge.from && to === edge.to) {
              return { ...e, label: `${edge.value}` };
            }

            return e;
          });
        }
      });

      setDownFile(
        encodeURIComponent(
          JSON.stringify(
            createFileFormat({ nodes: values.nodes, edges: values.edges }, startPoint, count)
          )
        )
      );
    }
  }, [defaultTableData]);

  useEffect(() => {
    inputsList.forEach(row =>
      row
        .filter(({ value }) => value)
        .forEach(({ id, value }) => {
          const [start, end] = id.split('/');
          const startElement = { id: start, label: start };
          const endElement = { id: end, label: end };

          if (start === end && !values.nodes.some(({ id: eID }) => eID === end)) {
            values.nodes.push(startElement);
          } else {
            if (!values.nodes.some(({ id: eID }) => eID === start)) {
              values.nodes.push(startElement);
            }

            if (!values.nodes.some(({ id: eID }) => eID === end)) {
              values.nodes.push(endElement);
            }
          }

          if (!values.edges.some(({ from, to }) => from === start && to === end)) {
            values.edges.push({
              from: start,
              to: end,
              label: value
            });
          } else {
            values.edges = values.edges.map(edge => {
              const { from, to } = edge;
              if (from === start && to === end) {
                return { ...edge, label: value };
              }

              return edge;
            });
          }
        })
    );

    if (network) {
      network.setData(values);
      setDownFile(
        encodeURIComponent(
          JSON.stringify(
            createFileFormat({ nodes: values.nodes, edges: values.edges }, startPoint, count)
          )
        )
      );
    }
  }, [inputsList]);

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
                  defaultValue={defaultTableData[`${index + 1}:${i + 1}`]}
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

  const changeStartPoint = ({ target: { value } }) => {
    setStartPoint(Number(value));
  };

  const startAlgorithm = () => {
    const newValue = calculate(values, startPoint);

    if (network) {
      network.setData(newValue);
      setDownFile(
        encodeURIComponent(
          JSON.stringify(
            createFileFormat({ nodes: newValue.nodes, edges: newValue.edges }, startPoint, count)
          )
        )
      );
    }
  };

  return (
    <div className="App">
      <div className="wrap">
        <div className="inputWrap">
          <span className="label">{locale.PointsCount}:</span>
          <input value={count} onChange={changeCount} />
        </div>
        <div className="inputWrap">
          <span className="label">{locale.StartPoint}:</span>
          <input value={startPoint} onChange={changeStartPoint} />
        </div>

        <button disabled={!startPoint} type="button" onClick={startAlgorithm} className="submitBtn">
          {locale.StartVisualization}
        </button>
        <div style={{ display: 'inline-block' }}>
          <input
            style={{ display: 'inline-block' }}
            className="file-input"
            type="file"
            onChange={e => fileReader.readAsText(e.target.files[0])}
          />
          {network && (
            <a
              style={{ display: 'inline-block' }}
              href={`data:text/json;charset=utf-8,${downFile}`}
              download="out.json"
            >
              DOWNLOAD DATA
            </a>
          )}
        </div>
      </div>
      {showTable && (
        <>
          <ReactTableFixedColumns
            minRows={1}
            data={firstData}
            columns={columns}
            defaultPageSize={5}
            className="-striped"
          />

          <Graph graph={values} getNetwork={setNetwork} options={options} />
        </>
      )}
    </div>
  );
};

export default App;
