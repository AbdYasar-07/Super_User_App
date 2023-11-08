import React, { useEffect, useState } from "react";
import Search from "../../../Utils/Search";
import DataGridTable from "../../../Utils/DataGridTable";
import AppSpinner from "../../../Utils/AppSpinner";
import Axios from "../../../Utils/Axios";
import { groupFilter } from "../../BusinessLogics/Logics";
import axios from "axios";

const BPtabel = () => {
  const [loading, setLoading] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [bpData, setBpData] = useState([]);
  const [filterRecord, setFilteredRecord] = useState([]);
  const [allGroups, setAllgroups] = useState([]);
  const resource = process.env.REACT_APP_AUTH_EXT_RESOURCE;

  const getCurrentData = () => {};
  const fetchAllGroups = async () => {
    try {
      const total_groups_response = await Axios(
        resource + "/groups",
        "GET",
        null,
        localStorage.getItem("auth_access_token")
      );

      const total_groups = await total_groups_response.groups;

      if (total_groups?.length > 0) {
        bindGroupData(groupFilter(total_groups, "BP_"));
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };
  const bindGroupData = (total_groups) => {
    total_groups = total_groups.map((_grp) => {
      return {
        id: _grp?._id,
        Name: _grp?.name,
        Description: _grp?.description,
        Member: _grp?.members?.length,
        ShopifyID: "",
        OSCID: "",
      };
    });
    if (total_groups?.length > 0) {
      setFilteredRecord(total_groups);
      setBpData(total_groups);
    }
  };
  // const fetchOSCIDRequest = async () => {
  //   await Axios(
  //     "https://service-staging.carrier.com.ph/services/rest/connect/v1.4/analyticsReportResults",
  //     "POST",
  //     JSON.stringify({
  //       id: 107164,
  //       filters: [
  //         {
  //           name: "SAP BP Code",
  //           values: "1000000046",
  //         },
  //       ],
  //     }),
  //     false,
  //     false,
  //     true
  //   ).then((res) => console.log(res, "res"));

  //   var myHeaders = new Headers();
  //   myHeaders.append("OSvC-CREST-Application-Context", "Fetch");
  //   myHeaders.append("Content-Type", "application/json");
  //   myHeaders.append("Access-Control-Allow-Origin", "*");
  //   // Access-Control-Allow-Origin: <origin>

  //   var raw = JSON.stringify({
  //     id: 107164,
  //     filters: [
  //       {
  //         name: "SAP BP Code",
  //         values: "1000010284",
  //       },
  //     ],
  //   });

  //   var requestOptions = {
  //     method: "POST",
  //     headers: myHeaders,
  //     body: raw,
  //     mode: "cors",
  //   };

  //   fetch(
  //     "https://service-staging.carrier.com.ph/services/rest/connect/v1.4/analyticsReportResults",
  //     requestOptions
  //   )
  //     .then((response) => response.text())
  //     .then((result) => console.log(result))
  //     .catch((error) => console.log("error", error));
  // };
  useEffect(() => {
    setLoading(true);
    fetchAllGroups();
    // fetchOSCIDRequest();
  }, []);
  return (
    <>
      <div className="py-4">
        <Search
          records={bpData}
          setRecords={setFilteredRecord}
          isSearchActived={setIsSearchActive}
          setLoadSpinner={setLoading}
          data={bpData}
        />
      </div>
      {!loading && (
        <DataGridTable
          data={filterRecord}
          rowHeader={[
            "Name",
            "Description",
            "Member",
            "Shopify ID",
            "OSC ID",
            "Action",
          ]}
          getCurrentData={getCurrentData}
          loading={loading}
          action={true}
        />
      )}
      {loading && <AppSpinner />}
    </>
  );
};

export default BPtabel;
