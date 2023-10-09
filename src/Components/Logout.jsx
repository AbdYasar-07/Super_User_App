import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch } from "react-redux";
import { clearState } from "../store/auth0Slice";

const Logout = () => {
  const { logout } = useAuth0();
  const dispatch = useDispatch();

  const onLogout = async () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    })
      .then(() => {
        dispatch(clearState());
        localStorage.removeItem("access_token");
        localStorage.removeItem("auth_access_token");
        localStorage.removeItem("user_profile");
        localStorage.removeItem("permissions");
        localStorage.removeItem("roles");
      })
      .catch((error) => {
        console.error("Error while logging out ::", error);
      })
      .finally(() => {
        console.log("removed local storages..");
      });
  };

  return (
    <div className="me-3">
      <button className="btn btn-primary " onClick={() => onLogout()}>
        Logout
      </button>
    </div>
  );
};

export default Logout;
