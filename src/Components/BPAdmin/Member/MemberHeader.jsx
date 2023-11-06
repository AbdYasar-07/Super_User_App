import React from "react";
import "../../Styles/NestedContent.css";
import ToggleSelection from "../../../Utils/ToggleSelection";
import { Button } from "primereact/button";

const MemberHeader = ({ userProfile }) => {
    return (
        <>
            <div
                className="d-flex align-items-center pt-2 pb-2 container profileHeader"
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
        </>
    );
}

export default MemberHeader
