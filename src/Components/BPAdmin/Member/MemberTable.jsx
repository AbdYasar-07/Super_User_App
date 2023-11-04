import React, { useState, useEffect } from "react";
import Search from "../../../Utils/Search";
import DataGridTable from "../../../Utils/DataTable";

const MemberTable = () => {
  const [filterRecord, setFilteredRecord] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [loading, setLoad] = useState(false);
  const [memberData, setMemberData] = useState([]);

  useEffect(() => {
    setFilteredRecord(dummmyData);
    setMemberData(dummmyData);
  }, []);
  return (
    <>
      <div className="py-4">
        <Search
          records={memberData}
          setRecords={setFilteredRecord}
          isSearchActived={setIsSearchActive}
          setLoadSpinner={setLoad}
          data={memberData}
        />
      </div>
      <DataGridTable
        data={filterRecord}
        rowHeader={[
          "Name",
          "Email",
          "Last Login",
          "Logins",
          "Connections",
          "BP",
        ]}
      />
      
    </>
  );
};
export default MemberTable;

const dummmyData = [
  {
    id: "1000",
    Name: "jeeva",
    Email: "jeeva@gmail.com",
    LastLogin: "nethu",
    Logins: "today",
    Connections: "conception",
    BP: "conception",
  },
];
