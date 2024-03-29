import React, { useEffect, useState } from "react";
import "../../Styles/NestedContent.css";
import ToggleSelection from "../../../Utils/ToggleSelection";
import { Button } from "primereact/button";
import { useParams } from "react-router-dom";
import Axios from "../../../Utils/Axios";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { getUserFieldFromAuth0 } from "../../BusinessLogics/Logics";
import { addManagementAccessToken, renderingCurrentUser } from "../../../store/auth0Slice";

const MemberHeader = ({ userProfile }) => {

    const { memberId } = useParams();
    const [assignedBP, setAssignedBP] = useState({});
    const endpoint = process.env.REACT_APP_MANAGEMENT_API;
    const auth0Context = useSelector((store) => store?.auth0Context);
    const resource = process.env.REACT_APP_AUTH_EXT_RESOURCE;
    const dispatch = useDispatch();

    useEffect(() => {
        handleUserProfileOnHardRefresh(memberId, userProfile);
        getGroupsForRenderedUser();
    }, []);

    useEffect(() => {
        getGroupsForRenderedUser();
    }, [auth0Context.addedBusinessPartner])

    const getGroupsForRenderedUser = async () => {
        let url = `${resource}/users/${memberId}/groups`;
        const response = await Axios(url, 'GET', null, localStorage.getItem("auth_access_token"), false);
        if (!axios.isAxiosError(response)) {
            filterGroupsByName(response, "BP_");
        } else {
            toast.error("Error while retriving BP", { theme: "colored" });
            console.error("Error ***", response);
        }
    };

    const fetchManagementToken = async () => {
        const body = {
            grant_type: process.env.REACT_APP_AUTH_GRANT_TYPE,
            client_id: process.env.REACT_APP_M2M_CLIENT_ID,
            client_secret: process.env.REACT_APP_M2M_CLIENT_SECRET,
            audience: process.env.REACT_APP_AUDIENCE,
        };
        return await Axios(endpoint, "POST", body, null, true).then((response) => {
            dispatch(
                addManagementAccessToken({
                    managementAccessToken: response.access_token,
                })
            );
            return response;
        });
    };

    const handleUserProfileOnHardRefresh = async (memberId, userProfile) => {
        if (!memberId) {
            toast.error(`Invalid member id. Unable to fetch user information`, { theme: "colored", autoClose: false });
            return;
        }

        // check only when the user profile not exists in the member header component
        if (typeof userProfile === "object" && Object.keys(userProfile).length === 0) {
            try {
                const response = await fetchManagementToken();
                const requiredInformations = await getUserFieldFromAuth0(memberId, null, response?.access_token, true);
                dispatch(renderingCurrentUser({ currentUser: JSON.parse(JSON.stringify(requiredInformations)) }));
                return requiredInformations;
            }
            catch {
                toast.error(`Error while retriving user member information`, { theme: "colored" });
            }
        }
    };

    const filterGroupsByName = (response, nameStartsWith) => {
        if (Array.isArray(response) && Array(response).length > 0) {
            const result = response.filter((group) => String(group.name).startsWith(nameStartsWith));
            if (result.length > 0)
                setAssignedBP(result[0]);
            else
                setAssignedBP("");
        }
    }


    return (
        <>
            <div
                className="d-flex align-items-center pt-2 pb-2  profileHeader"
                style={{
                    backgroundColor: "#e5e5e5",
                    height: "200px !important",
                }}
            >

                <div className="col-2">
                    <img
                        src={userProfile.picture}
                        alt="user profile"
                        class="rounded-circle"
                        width="80"
                        height="80"
                    />
                </div>
                <div
                    className="col-6 text-start d-flex align-items-center justify-content-between"
                    style={{ width: "82%" }}
                >
                    <div>
                        <h2 className="fw-normal">{userProfile.name}</h2>
                        <h5 className="fw-light text-secondary">{userProfile.email}</h5>
                        {(typeof userProfile.blocked === "boolean" || userProfile) && (
                            <Button
                                style={{
                                    borderRadius: "15px",
                                    height: "30px",
                                    margin: "10px",
                                }}
                                type="button"
                                size="small"
                                label={`user is ${userProfile.blocked === true ? "" : "un"
                                    }blocked`}
                                severity={`${userProfile.blocked === true ? "danger" : "info"
                                    }`}
                            ></Button>
                        )}
                        {typeof userProfile.email_verified === "boolean" && (
                            <Button
                                style={{
                                    borderRadius: "15px",
                                    height: "30px",
                                    margin: "10px",
                                }}
                                type="button"
                                size="small"
                                label={`user is ${userProfile.email_verified === true ? "" : "un"
                                    }verified`}
                                severity={
                                    userProfile.email_verified === true ? "info" : "danger"
                                }
                            ></Button>
                        )}
                    </div>
                    <div className="d-flex flex-column align-items-center justify-content-center">
                        <ToggleSelection />
                    </div>
                </div>
            </div>
            {
                typeof assignedBP === "object" && Object.keys(assignedBP).length > 0 &&
                < div >
                    <Button
                        style={{
                            display: "flex",
                            paddingLeft: "10px",
                            padding: "10px",
                        }}
                        type="button" label={`Member of ${assignedBP.name} (${assignedBP.description})`} icon="pi pi-user" severity="secondary"></Button>
                </ div>
            }
            <ToastContainer />
        </>
    );
}

export default MemberHeader
