import React, { useState } from "react";
import ContentHeader from "../../Contents/ContentHeader";
import AddUser from "../../Users/AddUser";
import MemberTable from "./MemberTable";
import "../../Styles/Member.css";
import ImportUserModal from "../../../Utils/ImportUserModal";
import TableData from "../../../Utils/TableData";
const Member = () => {
  const [isUserAdded, setIsUserAdded] = useState(false);
  const [isTokenFetched, setIsTokenFteched] = useState(false);
  const [isPasteModelShow, setIsPasteModelShow] = useState(false);
  const [isPasteCancel, setIsPasteCancel] = useState(false);
  const [isTableShow, setIsTableShow] = useState(false);
  const [tableData, setTableData] = useState([]);
  return (
    <div className="container">
      <ContentHeader
        title="Maintain Members"
        description=""
        customStyle={"fs-3 text-secondary"}
      />
      <div className="position-relative">
        <div>
          <MemberTable />
        </div>
        <div className="position-absolute end-0 p-0 me-4 customizePosition">
          <AddUser
            buttonLabel="Member"
            setIsUserAdded={setIsUserAdded}
            isTokenFetched={isTokenFetched}
            setIsPasteModelShow={setIsPasteModelShow}
            isPasteCancel={isPasteCancel}
            setIsPasteCancel={setIsPasteCancel}
          />
        </div>
        <div>
          <ImportUserModal
            isPasteModelShow={isPasteModelShow}
            setIsPasteCancel={setIsPasteCancel}
            setTableData={setTableData}
            setIsTableShow={setIsTableShow}
          />
        </div>
        <div>
          <TableData
            data={tableData}
            isTableShow={isTableShow}
            setIsTableShow={setIsTableShow}
            setTableData={setTableData}
            setIsPasteModelShow={setIsPasteModelShow}
            setIsPasteCancel={setIsPasteCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default Member;
