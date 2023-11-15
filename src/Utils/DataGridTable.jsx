import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import React, { useEffect } from "react";
import { BiPencil, BiUserPlus } from "react-icons/bi";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { renderComponent } from "../store/auth0Slice";

const DataGridTable = ({ data, rowHeader, getCurrentData, loading, action, emptyMessage }) => {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const alignHeader = (column) => {
    if (!column) return;

    if (column && column.split(" ").length >= 2) {
      column = String(column).replaceAll(" ", "");
      return column;
    }

    return column;
  };

  const handleClickOnName = (rowData) => {
    return (
      <div
        className="text-primary"
        style={{ cursor: "pointer" }}
        onClick={() => getCurrentData(rowData)}
      >
        {rowData[alignHeader(rowHeader[0])]}
      </div>
    );
  };

  const handleActionClick = () => {
    dispatch(renderComponent({ cmpName: "MEMBER" }));
    navigate("/members");
  };

  const handelAction = (rowData) => {
    return (
      <div className="d-flex align-items-center">
        <BiUserPlus
          style={{
            fontSize: "24px",
            color: "#363535",
            width: "30px",
            height: "30px",
            padding: "4px",
            borderRadius: "3px",
            cursor: "pointer"
          }}
          title="Add member"
          className="mx-1 fw-light"
          onClick={() => handleActionClick()}
        />
        <BiPencil
          style={{
            fontSize: "24px",
            color: "#363535",
            width: "30px",
            height: "30px",
            padding: "4px",
            borderRadius: "3px",
            cursor: "pointer"
          }}
          title="Edit BP"
          className="mx-1"
        />
      </div>
    );
  };
  return (
    <div className="card">
      <DataTable
        value={data}
        removableSort
        filterDisplay="row"
        paginator={data.length >= 10}
        rows={10}
        tableStyle={{ minWidth: "50rem" }}
        emptyMessage={emptyMessage}
        loading={loading}
      >
        {rowHeader?.map((colHeader) => {
          return (
            <Column
              field={alignHeader(colHeader)}
              header={colHeader}
              filter={!(colHeader === "Action")}
              sortable={!(colHeader === "Action")}
              style={{
                width: "fit-content",
              }}
              body={
                action
                  ? colHeader === rowHeader[0]
                    ? handleClickOnName
                    : colHeader === "Action"
                      ? handelAction
                      : ""
                  : colHeader === rowHeader[0] && handleClickOnName
              }
            ></Column>
          );
        })}
      </DataTable>
    </div>
  );
};

export default DataGridTable;
