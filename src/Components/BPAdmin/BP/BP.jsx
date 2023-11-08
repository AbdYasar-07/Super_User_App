import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Axios from "../../../Utils/Axios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { addAuthorizationCode } from "../../../store/auth0Slice";
import ContentHeader from "../../Contents/ContentHeader";
import MemberTable from "../Member/MemberTable";
import AddUser from "../../Users/AddUser";
import ImportUserModal from "../../../Utils/ImportUserModal";
import TableData from "../../../Utils/TableData";
import BPtabel from "./BPtabel";
import AppSpinner from "../../../Utils/AppSpinner";
const BP = () => {
  const dispatch = useDispatch();
  const { getAccessTokenSilently } = useAuth0();

  const [isUserAdded, setIsUserAdded] = useState(false);
  const [isTokenFetched, setIsTokenFteched] = useState(false);
  const [isPasteModelShow, setIsPasteModelShow] = useState(false);
  const [isPasteCancel, setIsPasteCancel] = useState(false);
  const [isTableShow, setIsTableShow] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [loading, setIsLoading] = useState(false);
  const fetchAccessToken = async () => {
    await getAccessTokenSilently()
      .then(async (response) => {
        localStorage.setItem("access_token", response);
        return await fetchAuthorizationToken().then(() => {
          return true;
        });
      })
      .catch((error) => {
        toast("Login required", { type: "error", position: "top-center" });
        console.error("Error while fetching token", error);
        setIsLoading(false);
      });
  };
  const fetchAuthorizationToken = async () => {
    const body = {
      grant_type: process.env.REACT_APP_AUTH_GRANT_TYPE,
      client_id: process.env.REACT_APP_M2M_CLIENT_ID,
      client_secret: process.env.REACT_APP_M2M_CLIENT_SECRET,
      audience: process.env.REACT_APP_M2M_AUDIENCE,
    };
    if (
      localStorage.getItem("access_token") &&
      localStorage.getItem("access_token").toString().length > 0
    ) {
      const authorizationResponse = Axios(
        "https://dev-34chvqyi4i2beker.jp.auth0.com/oauth/token",
        "POST",
        body,
        null
      );
      authorizationResponse
        .then((tkn) => {
          localStorage.setItem("auth_access_token", tkn.access_token);
          dispatch(addAuthorizationCode({ code: tkn.access_token }));
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error while fetching authorization token ::", error);
          setIsLoading(false);
        });
    }
  };

  useEffect(() => {
    if (
      !localStorage.getItem("access_token") &&
      !localStorage.getItem("auth_access_token")
    ) {
      fetchAccessToken();
      setIsLoading(true);
    }
  }, []);
  return (
    <>
      {loading ? (
        <AppSpinner />
      ) : (
        <div className="container">
          <ContentHeader
            title="Business Partners"
            description="Open a BP to amend their details or manage its assigned Members"
            customStyle={""}
          />
          <div className="position-relative">
            <div>
              <BPtabel />
            </div>
            <div className="position-absolute end-0 p-0 me-4 customizePosition">
              <AddUser
                buttonLabel="BP"
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
      )}
    </>
  );
};

export default BP;
