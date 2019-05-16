/* eslint-disable no-console */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ReactTable from 'react-table';
import withFixedColumns from 'react-table-hoc-fixed-columns';
import Graph from 'react-graph-vis';

import calculate from './algorithm2';
import locale from './locale.json';

import './App.css';
import { addToArray, fixedFirst, createMatrix, createFileFormat } from './utils';

const options = {
  layout: {
    hierarchical: false
  },
  physics: {
    enabled: false
  },
  autoResize: true,
  edges: {
    smooth: {
      type: 'cubicBezier'
    },
    arrows: {
      to: { enabled: true, scaleFactor: 1, type: 'arrow' },
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
  const [nodesValues, setNodesValues] = useState([]);
  const [file, setFileData] = useState({});
  const [count, setCount] = useState(0);
  const [flow, setMaxFlow] = useState(0);

  const [columns, setColumns] = useState([]);
  const [firstData, setFirstData] = useState([]);
  const [inputsList, setInputsList] = useState([]);
  const [network, setNetwork] = useState(undefined);
  const [downFile, setDownFile] = useState(values);

  const columnsLength = useMemo(() => columns.length, [columns.length]);
  const showTable = useMemo(() => Boolean(columnsLength), [columnsLength]);

  fileReader.onload = e => {
    setFileData(JSON.parse(e.target.result));
  };

  const handleInputChange = useCallback((row, cell, value, id) => {
    setInputsList(list => {
      const element = list[row][cell];
      element.value = value;
      element.id = id;

      return [...list];
    });
  }, []);

  const changeCount = useCallback(
    ({ target: { value: inputValue } }, dataParam = null) => {
      const value = Number(inputValue);

      // TODO: ADD SOME WARNING ABOUT POSSIBLE BROWSER FREEZE
      if (value < 100) {
        if (value > columnsLength) {
          const valueArray = new Array(value).fill(null);

          setFirstData(d =>
            addToArray(d, value - d.length).map((_, index) => {
              const result = {};

              valueArray.forEach((__, i) => {
                const id = `${index + 1}/${i + 1}`;
                console.log('defaultTableData', defaultTableData);
                const source = dataParam || defaultTableData;
                const data = source[`${index + 1}:${i + 1}`];

                result[i + 1] = (
                  <input
                    id={id}
                    onChange={({ target: { value: edgeValue } }) =>
                      handleInputChange(index, i, edgeValue, id)
                    }
                    defaultValue={data}
                    type="number"
                  />
                );
              });

              result['0'] = index + 1;

              return result;
            })
          );

          setColumns(c =>
            fixedFirst(
              addToArray(c, value - c.length + 1, index => ({
                Header: `${c.length + index}`,
                accessor: `${c.length + index}`,
                style: { textAlign: 'center' }
              }))
            )
          );
        } else {
          setColumns(c => c.slice(0, value + 1));
          setFirstData(d => d.slice(0, value));
        }
      }

      setCount(inputValue);
      setInputsList(createMatrix(Number(inputValue)));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnsLength, JSON.stringify(defaultTableData), handleInputChange]
  );

  useEffect(() => {
    if (Object.keys(file).length) {
      values = { nodes: [], edges: [] };
      changeCount({ target: { value: file.nodes.length } });
      const nodesL = [];
      file.nodes.forEach((node, index) => {
        nodesL.push(node.label);
        if (typeof node === 'object') {
          if (!values.nodes.some(({ id }) => id === node.id)) {
            values.nodes.push({ id: node.id, label: node.label, color: node.color });
          }
        } else {
          // eslint-disable-next-line no-lonely-if
          if (!values.nodes.some(({ id }) => id === node)) {
            values.nodes.push({ id: node, label: node, color: node.color });
          }
        }
      });

      setNodesValues(nodesL.map(v => Number(v)));

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

      setDefaultTableData(
        file.edges.reduce(
          (acc, edge) => ({ ...acc, [`${edge.from}:${edge.to}`]: Number(edge.value) }),
          {}
        )
      );

      setDownFile(
        encodeURIComponent(
          JSON.stringify(
            createFileFormat(
              { nodes: values.nodes, edges: values.edges },
              file.nodes.filter(({ id }) => id !== 'T' && id !== 'S').length
            )
          )
        )
      );

      changeCount(
        {
          target: { value: file.nodes.filter(({ id }) => id !== 'T' && id !== 'S').length }
        },
        file.edges.reduce(
          (acc, edge) => ({ ...acc, [`${edge.from}:${edge.to}`]: Number(edge.value) }),
          {}
        )
      );
    }
  }, [changeCount, file]);

  console.log(defaultTableData);

  useEffect(() => {
    inputsList.forEach(row =>
      row
        .filter(({ value }) => value)
        .forEach(({ id, value }) => {
          const [start, end] = id.split('/');
          const startElement = { id: start, label: nodesValues[Number(start - 1)] };
          const endElement = { id: end, label: nodesValues[Number(end - 1)] };

          if (start === end && !values.nodes.some(({ id: eID }) => eID === end)) {
            values.nodes.push(startElement);
          } else {
            if (!values.nodes.some(({ id: eID }) => eID === start)) {
              values.nodes.push(startElement);
            } else {
              const nodeIndex = values.nodes.findIndex(({ id: eID }) => eID === start);

              values.nodes[nodeIndex] = startElement;
            }

            if (!values.nodes.some(({ id: eID }) => eID === end)) {
              values.nodes.push(endElement);
            } else {
              const nodeIndex = values.nodes.findIndex(({ id: eID }) => eID === end);

              values.nodes[nodeIndex] = endElement;
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
          JSON.stringify(createFileFormat({ nodes: values.nodes, edges: values.edges }, count))
        )
      );
    }
  }, [count, inputsList, network, nodesValues]);

  const startAlgorithm = useCallback(() => {
    const [newValue, maxFlow] = calculate(values);

    if (network) {
      setMaxFlow(maxFlow);
      network.setData(newValue);
      setDownFile(
        encodeURIComponent(
          JSON.stringify(createFileFormat({ nodes: newValue.nodes, edges: newValue.edges }, count))
        )
      );
    }
  }, [count, network]);

  const inputs = useMemo(
    () =>
      new Array(Number(count)).fill(0).map((_, index) => (
        <>
          Точка {index + 1}:{' '}
          <input
            value={nodesValues[index]}
            onChange={({ target: { value } }) =>
              setNodesValues(old => {
                const newValues = [...old];

                newValues[index] = value;

                return newValues;
              })
            }
          />
        </>
      )),
    [count, nodesValues]
  );

  return (
    <div className="App">
      <div className="wrap">
        <Link to="/">
          <button type="button" className="submitBtn">
            Повернутись на головно сторінку
          </button>
        </Link>
        <div className="inputWrap">
          <span className="label">{locale.PointsCount}:</span>
          <input value={count} onChange={changeCount} type="number" />
        </div>

        {inputs}

        <button
          // disabled={nodesValues.filter(v => v).length !== Number(count)}
          type="button"
          onClick={startAlgorithm}
          className="submitBtn"
        >
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
              ЗАВАНТАЖИТИ
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
          <p>Величина максимального потоку: {flow}</p>
          <Graph graph={values} getNetwork={setNetwork} options={options} />
        </>
      )}
    </div>
  );
};

export default App;
