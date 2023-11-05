import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import React from "react";

const DataGridTable = ({ data, rowHeader, getCurrentData, loading }) => {
  const alignHeader = (column) => {
    if (!column) return;

    if (column.split(" ").length > 0) {
      column = String(column).replaceAll(" ", "");
      return column;
    }

    return column;
  };

  const handleClickOnName = (rowData) => {
    return (
      <div
        className="text-primary"
        style={{ textDecoration: "underline", cursor: "pointer" }}
        onClick={() => getCurrentData(rowData)}
      >
        {rowData[rowHeader[0]]}
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
        emptyMessage="No members found."
        loading={loading}
      >
        {rowHeader?.map((colHeader) => {
          return (
            <Column
              field={alignHeader(colHeader)}
              header={colHeader}
              filter
              sortable
              style={{
                width: "fit-content",
              }}
              body={colHeader === rowHeader[0] && handleClickOnName}
            ></Column>
          );
        })}
      </DataTable>
    </div>
  );
};

export default DataGridTable;
