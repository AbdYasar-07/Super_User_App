import React, { useEffect, useRef, useState, useStyles } from "react";
import Modal from "react-bootstrap/Modal";
import { BiPaste, BiXCircle, BiX } from "react-icons/bi";
import Box from "@mui/material/Box";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
  gridFilterModelSelector,
  useGridApiRef,
} from "@mui/x-data-grid";
import { Button } from "@mui/material";
import "../Components/Styles/TableData.css";
import { Container } from "react-bootstrap";
import { toast } from "react-toastify";

const TableData = ({
  data,
  tableHeader = "Imported User",
  setTableData,
  setIsPasteCancel,
  setIsPasteModelShow,
  isTableShow,
  setIsTableShow,
}) => {
  const gridApiRef = useGridApiRef();
  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "UserEmail", headerName: "UserEmail", width: 190, editable: true },
    { field: "Password", headerName: "Password", width: 190, editable: true },
    {
      field: "Connection",
      headerName: "Connection",
      width: 190,
    },
  ];
  const [isActivateConfirmModal, setIsActivateConfirmModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [confirmationModalData, setConfirmationModalData] = useState({
    id: "",
    header: "",
    content: "",
  });
  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
      </GridToolbarContainer>
    );
  };

  const getImportedUsers = (id) => {
    if (id === "m1") {
      if (getSelectedValue()?.length === 0) {
        // setTableData([]);
        setTableData(getEditedValues());
        setIsPasteModelShow(false);
        console.log(getEditedValues(), "imported data");
      } else {
        console.log(getSelectedValue(), "imported data");
      }
      setIsTableShow(false);
      setIsActivateConfirmModal(false);
    }
    if (id === "c1") {
      setTableData([]);
      setIsActivateConfirmModal(false);
    }
  };

  const getEditedValues = () => {
    let editedValue = [];
    gridApiRef.current.getRowModels().forEach((val) => {
      if (val) {
        editedValue?.push(val);
      }
    });
    if (editedValue) {
      setTableData(editedValue);
    }
    return editedValue;
  };
  const getSelectedValue = () => {
    let fileredData = [];
    console.log(selectedRows?.length, "length");
    selectedRows?.forEach((selectValueId) => {
      let foundedData = getEditedValues()?.find(
        (ele) => ele.id === selectValueId
      );
      if (foundedData) {
        fileredData.push(foundedData);
      }
    });
    return fileredData;
  };
  const onImport = () => {
    if (selectedRows?.length === 0) {
      toast.warn("Please select atleast one row", { theme: "colored" });
      return;
    }
    setConfirmationModalData({
      id: "m1",
      header: "Confirmation Import user",
      content: "Are you sure want to import the user's",
    });
    setIsActivateConfirmModal(true);
  };
  return (
    <>
      {isTableShow && (
        <div>
          <Modal
            className="tableDataModal"
            size="lg"
            show={data.length !== 0 ? true : false}
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Body>
              <Row
                style={{
                  display: "felx",
                  alignItems: "center",
                  padding: "10px 0",
                }}
              >
                <Col>
                  <h4>{tableHeader}</h4>
                </Col>
                <Col style={{ textAlign: "end" }}>
                  <BiXCircle
                    className="fs-2"
                    style={{ opacity: "0.9", margin: "10px 0" }}
                    onClick={() => {
                      setTableData([]);
                      setIsPasteCancel(true);
                    }}
                  />
                </Col>
              </Row>

              {data.length !== 0 && (
                <Box sx={{ height: 400, width: "100%" }}>
                  <DataGrid
                    componentsProps={{ panel: { disablePortal: true } }}
                    rows={data}
                    onRowSelectionModelChange={(newRowSelectionModel) => {
                      setSelectedRows(newRowSelectionModel);
                    }}
                    onStateChange={() => {
                      // getEditedValues();
                    }}
                    columns={columns}
                    apiRef={gridApiRef}
                    initialState={{
                      pagination: {
                        paginationModel: {
                          pageSize: 5,
                        },
                      },
                    }}
                    pageSizeOptions={[5]}
                    slots={{
                      toolbar: CustomToolbar,
                    }}
                    checkboxSelection
                    disableRowSelectionOnClick
                  />
                </Box>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  setIsActivateConfirmModal(true);
                  setConfirmationModalData({
                    id: "c1",
                    header: "Cancel",
                    content: "Are you sure want to cancel the process",
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                variant="outlined"
                color="info"
                className="mx-2"
                onClick={() => setTableData([])}
              >
                reset
              </Button>
              <Button
                variant="contained"
                color="primary"
                className="mx-2"
                onClick={() => {
                  onImport();
                }}
              >
                Import User
              </Button>
            </Modal.Footer>
          </Modal>
          {isActivateConfirmModal && (
            <Modal
              className="confirmationModal"
              size="lg"
              show={true}
              aria-labelledby="contained-modal-title-vcenter"
              centered
              onHide={() => setIsActivateConfirmModal(false)}
            >
              <Modal.Header closeButton>
                <h6>{confirmationModalData?.header}</h6>
              </Modal.Header>
              <Modal.Body>
                <p>{confirmationModalData?.content}</p>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setIsActivateConfirmModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="outlined"
                  color="info"
                  className="mx-2"
                  onClick={() => {
                    getImportedUsers(confirmationModalData?.id);
                  }}
                >
                  OK
                </Button>
              </Modal.Footer>
            </Modal>
          )}
        </div>
      )}
    </>
  );
};

export default TableData;
