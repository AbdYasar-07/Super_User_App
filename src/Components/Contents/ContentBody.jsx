/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { useState, useEffect } from "react";
import Axios from "../../Utils/Axios";
import Pagination from "../../Utils/Pagination";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import AppSpinner from "../../Utils/AppSpinner";
import { FaUser } from "react-icons/fa";

const ContentBody = ({isUserAdded}) => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { getAccessTokenSilently } = useAuth0();
  const [loadSpinner, setLoadSpinner] = useState(true);

  const resource = process.env.REACT_APP_AUTH_EXT_RESOURCE;

  const fetchAccessToken = async () => {
    await getAccessTokenSilently()
      .then(async (response) => {
        localStorage.setItem("access_token", response);
        await fetchAuthorizationToken();
      })
      .catch((error) => {
        console.error("Error while fetching token", error);
        setLoadSpinner(false);
      });
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) {
      return "Never";
    }
    const date = new Date(timestamp);
    const now = new Date();

    const diffInMilliseconds = Math.abs(now - date);
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
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
          authExtensionApi(
            "users",
            "GET",
            null,
            localStorage.getItem("auth_access_token")
          );
        })
        .catch((error) => {
          console.error("Error while fetching authorization token ::", error);
        })
        .finally(() => {
          setLoadSpinner(false);
        });
    }
  };

  const authExtensionApi = async (url, method, body, token) => {
    const response = Axios(resource + `/${url}`, method, body, token);
    response
      .then((data) => {
        setData(data.users);
      })
      .catch((error) => {
        console.error(
          "Error while accessing authorization resource :::",
          error
        );
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchAccessToken();
      } catch (error) {
        console.error("error ::", error);
      }
    };
    fetchData();
  }, []);
  
  useEffect(()=>{
    authExtensionApi(
      "users",
      "GET",
      null,
      localStorage.getItem("auth_access_token")
    );
  },[isUserAdded])
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data && data.slice(indexOfFirstItem, indexOfLastItem);
        console.log(currentItems,"currentItems");
  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <div>
      {loadSpinner && <AppSpinner />}
      {!loadSpinner && (
        <div className="container" style={{ height: "499px" }}>
          {" "}
          <hr />
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Last Login</th>
                <th>Logins</th>
                <th>Connection</th>
              </tr>
            </thead>
            <tbody>
              {currentItems &&
                currentItems.map((item) => (
                  <tr key={item.user_id}>
                    <td>
                      <Link to={`/users/${item.user_id}`}>{item.name}</Link>
                    </td>
                    <td>{item.email}</td>
                    <td>{formatTimestamp(item.last_login)}</td>
                    <td>{item.logins_count}</td>
                    <td>{item.identities[0].connection}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {!loadSpinner && !localStorage.getItem("auth_access_token") && (
            <div>
              <h6>
                No user's found <FaUser style={{ marginBottom: "5px" }} />{" "}
              </h6>
            </div>
          )}
        </div>
      )}
      {!loadSpinner && localStorage.getItem("auth_access_token") && (
        <div className="paginator container">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(data && data.length / itemsPerPage)}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default ContentBody;
