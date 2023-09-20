import React, { useState, useEffect } from "react";
import { create, all } from "mathjs";

const config = {};
const math = create(all, config);

export default function Matrice({ lines, columns, name, reset }) {
  const [matrix, setMatrix] = useState(
    localStorage.getItem(name)
      ? JSON.parse(localStorage.getItem(name))
      : math.zeros(parseInt(lines), parseInt(columns))._data
  );

  useEffect(() => {
    const mt = math.resize(matrix, [parseInt(lines), parseInt(columns)], 0);
    setMatrix(mt);

    localStorage.setItem(name, JSON.stringify(mt));
  }, [lines, columns]);

  useEffect(() => {
    if (reset > 0) {
      const newMatrix = math.zeros(parseInt(lines), parseInt(columns))._data;
      setMatrix(newMatrix);
      localStorage.setItem(name, JSON.stringify(newMatrix));
    }
  }, [reset]);

  function handleKeyUp(event, i, j) {
    if (isNaN(matrix[i][j])) {
      event.target.value = 0;
      handleInputChange(event, i, j);
      event.target.select();
    }
  }

  const handleInputChange = (e, i, j) => {
    const value = parseInt(e.target.value);
    const newMatrix = math.clone(matrix);
    newMatrix[i][j] = value;
    setMatrix(newMatrix);
    switch (name) {
      case "pre":
        localStorage.setItem("pre", JSON.stringify(newMatrix));
        break;
      case "post":
        localStorage.setItem("post", JSON.stringify(newMatrix));
        break;
      case "M0":
        localStorage.setItem("M0", JSON.stringify(newMatrix));
        break;
      case "inh":
        localStorage.setItem("inh", JSON.stringify(newMatrix));
      default:
        break;
    }
  };

  const handleFocus = (e) => {
    if (e.target.value == 0) {
      e.target.select();
      let input = e.target;
      input.className =
        "bg-transparent text-center w-10 h-10 focus:outline-none ";
    }
  };

  const divs = [];

  for (let i = 0; i < lines; i++) {
    const row = [];
    for (let j = 0; j < columns; j++) {
      row.push(
        <div key={`${i}-${j}`}>
          {i == 0 && (
            <span className={" flex items-center justify-center "}>
              {/*  if the matrix is M0 dont show the number of the column */}
              {name == "M0" ? " M0" : "T" + parseInt(j + 1)}
            </span>
          )}
          <div
            className={
              "text-[#484848] bg-white flex items-center justify-center p-7 w-[20px] h-[20px] rounded-[15%] border-solid border-purple border-[1px] m-[1px] "
            }
            key={`${i}-${j}`}
          >
            <input
              type="number"
              key={`${i}-${j}`}
              id={`${i}-${j}`}
              className="bg-transparent text-center w-10 h-10 focus:outline-none text-[#484848] "
              onChange={(e) => handleInputChange(e, i, j)}
              value={matrix[i]?.[j] ?? 0}
              onKeyUp={(e) => {
                handleKeyUp(e, i, j);
              }}
              onFocus={(e) => {
                handleFocus(e);
              }}
              min={0}
            />
          </div>
        </div>
      );
    }
    divs.push(
      <div className="flex items-center justify-center font-default  " key={i}>
        <div className={" flex items-center  mx-2    " + (i == 0 && " mt-8 ")}>
          P {parseInt(i + 1)}
        </div>
        {row}
      </div>
    );
  }
  return <div className="p-4">{divs}</div>;
}
