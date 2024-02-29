import React, { useState, useEffect } from "react";
import Axios from "../Utils/Axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  roleFilter,
  toMapApplicationNames,
} from "../Components/BusinessLogics/Logics";
import { toast } from "react-toastify";
const AppModal = ({
  buttonLabel,
  dialogBoxHeader,
  tableRow,
  showButton,
  scopes,
  setIsAdded,
  isAdded,
  isRoles,
  isDeleted,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [checkboxData, setCheckboxData] = useState([]);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  const { userId, memberId } = useParams();
  const resource = process.env.REACT_APP_AUTH_EXT_RESOURCE;

  const fetchData = async () => {
    try {
      const total_groups_response = await Axios(
        resource + "/groups",
        "GET",
        null,
        localStorage.getItem("auth_access_token")
      );
      const total_groups = await total_groups_response.groups;
      await Axios(
        resource + `/users/${userId ? userId : memberId}/groups`,
        "GET",
        null,
        localStorage.getItem("auth_access_token")
      ).then((response) => {
        const rem_groups = total_groups.filter(
          (item) => !response.some((obj) => obj._id === item._id)
        );
        setCheckboxData(rem_groups);
        setIsLoaded(false);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getManagementToken = async () => {
    let managementApi = process.env.REACT_APP_MANAGEMENT_API;
    let data = {
      client_id: process.env.REACT_APP_AUTH_MANAGEMENT_CLIENT_ID,
      client_secret: process.env.REACT_APP_AUTH_MANAGEMENT_CLIENT_SECRET,
      audience: process.env.REACT_APP_AUTH_MANAGEMENT_AUDIENCE,
      grant_type: "client_credentials",
    };

    return await Axios(managementApi, "POST", data, null, true)
      .then((response) => {
        return response?.access_token;
      })
      .catch((error) => {
        console.error("error ::", error);
      });
  };

  const getClientsInfo = async () => {
    return await getManagementToken().then(async (tkn) => {
      return await Axios(
        process.env.REACT_APP_AUTH_GET_CLIENT_INFO,
        "GET",
        null,
        tkn,
        true
      )
        .then((response) => {
          if (response && response?.clients?.length > 0) {
            return response?.clients;
          }
        })
        .catch((error) => console.log(error));
    });
  };

  const fetchRoles = async () => {
    await Axios(
      resource + `/roles`,
      "GET",
      null,
      localStorage.getItem("auth_access_token")
    )
      .then(async (response) => {
        const allRoles = response.roles;
        await Axios(
          resource + `/users/${userId ? userId : memberId}/roles`,
          "GET",
          null,
          localStorage.getItem("auth_access_token")
        )
          .then(async (response) => {
            const remRoles = allRoles.filter(
              (item) => !response.some((obj) => obj._id === item._id)
            );
            await getClientsInfo().then((clientsinfo) => {
              if (toMapApplicationNames(remRoles, clientsinfo).length > 0) {
                if (memberId) {
                  let totalRoles = toMapApplicationNames(remRoles, clientsinfo);
                  let memberRoles = totalRoles.filter((role) =>
                    String(role.name).startsWith("PSP_BP")
                  );
                  setCheckboxData(memberRoles);
                } else {
                  setCheckboxData(toMapApplicationNames(remRoles, clientsinfo));
                }
              }
              setIsLoaded(false);
            });
          })
          .catch((error) => {
            console.log(error);
            setIsLoaded(false);
          });
      })
      .catch((error) => {
        console.error(
          "Error while getting assigned roles to the user :::",
          error
        );
      })
      .finally(() => { });
  };

  useEffect(() => {
    if (!isRoles) fetchData();
    if (isRoles) fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, isAdded, isDeleted]);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedCheckboxes([]);
    setShowModal(false);
  };

  const handleCheckboxChange = (checkboxId) => {
    const updatedCheckboxes = [...selectedCheckboxes];

    if (updatedCheckboxes.includes(checkboxId)) {
      updatedCheckboxes.splice(updatedCheckboxes.indexOf(checkboxId), 1);
    } else {
      updatedCheckboxes.push(checkboxId);
    }

    setSelectedCheckboxes(updatedCheckboxes);
  };

  const addUserToGroups = async () => {
    await Axios(
      resource + `/users/${userId ? userId : memberId}/groups`,
      "PATCH",
      selectedCheckboxes,
      localStorage.getItem("auth_access_token")
    )
      .then((response) => {
        setIsAdded(true);
        closeModal();
      })
      .catch((error) => {
        console.error("Error while adding a user to group", error);
      });
  };

  const addUserToRoles = async () => {
    await Axios(
      resource + `/users/${userId ? userId : memberId}/roles`,
      "PATCH",
      selectedCheckboxes,
      localStorage.getItem("auth_access_token")
    )
      .then((response) => {
        toast.success(`${selectedCheckboxes.length == 1 ? 'Role' : 'Roles'} has been added successfully.`, { theme: "colored" });
        setIsAdded(true);
        closeModal();
      })
      .catch((error) => {
        toast.error(`Error while adding ${selectedCheckboxes.length == 1 ? 'role' : 'roles'}`, { theme: "colored" });
        console.error("Error while adding a user to role", error);
      });
  };

  const handleCursorBehaviour = () => {
    return selectedCheckboxes.length === 0 ? "not-allowed" : "pointer";
  };

  const handleAdd = async () => {
    try {
      if (!isRoles) {
        await addUserToGroups();
      }

      if (isRoles) {
        await addUserToRoles();
      }
    } catch (error) {
      console.error(error);
    }
  };
  console.log(checkboxData, "checkboxDatacheckboxData", isLoaded);
  return (
    <>
      {showButton && (
        <>
          <button
            type="button"
            class="btn btn-primary"
            onClick={openModal}
          >
            + {buttonLabel}
          </button>

          {showModal &&
            <div
              class="modal fade show"
              style={{ display: "block", background: "#adadad70" }}
            >
              <div class="modal-dialog" style={{ width: "fit-content" }}>
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">
                      {dialogBoxHeader}
                    </h5>
                    <button
                      type="button"
                      class="btn-close"
                      onClick={closeModal}
                    ></button>
                  </div>
                  {checkboxData && checkboxData.length > 0 && (
                    <div class="modal-body">
                      <table>
                        <thead>
                          <tr>
                            {tableRow?.map((tableRow, index) => {
                              return (
                                <>
                                  <th
                                    key={index + 1}
                                    style={{
                                      textAlign: "left",
                                      paddingLeft: "10px",
                                    }}
                                  >
                                    {tableRow}
                                  </th>
                                </>
                              );
                            })}
                            {isRoles && <th>Application Name</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {checkboxData &&
                            checkboxData.map((checkbox) => (
                              <tr key={checkbox._id}>
                                <td>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      id={checkbox._id}
                                      style={{ marginRight: "5px" }}
                                      checked={selectedCheckboxes.includes(
                                        checkbox._id
                                      )}
                                      onChange={() =>
                                        handleCheckboxChange(checkbox._id)
                                      }
                                    />
                                    <label htmlFor={checkbox.id}>
                                      {checkbox.name}
                                    </label>
                                  </div>
                                </td>
                                <td>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "right",
                                      textAlign: "left",
                                      paddingLeft: "10px",
                                    }}
                                  >
                                    {checkbox.description}
                                  </div>
                                </td>
                                {checkbox.applicationName && (
                                  <td>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "right",
                                        textAlign: "left",
                                        paddingLeft: "10px",
                                      }}
                                    >
                                      {checkbox.applicationName}
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {!isLoaded && checkboxData?.length === 0 && (
                    <h5>No more {scopes} to add.</h5>
                  )}
                  <div class="modal-footer">
                    {checkboxData && checkboxData.length > 0 && (
                      <>
                        <button
                          type="button"
                          class="btn btn-secondary"
                          onClick={closeModal}
                        >
                          CLOSE
                        </button>
                        <button
                          disabled={selectedCheckboxes.length === 0}
                          style={{
                            pointerEvents: "auto",
                            cursor: handleCursorBehaviour(),
                          }}
                          type="button"
                          class="btn btn-primary"
                          onClick={handleAdd}
                        >
                          ADD
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>}
        </>
      )}
    </>
  );
};

export default AppModal;
