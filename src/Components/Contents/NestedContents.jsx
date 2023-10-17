/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import Axios from "../../Utils/Axios";
import Tabs from "./Tabs";
import "../Styles/NestedContent.css";
import { useNavigate, useParams } from "react-router-dom";
import ToggleSelection from "../../Utils/ToggleSelection";
import AppSpinner from "../../Utils/AppSpinner";
import { Button } from 'primereact/button';
import { useDispatch, useSelector } from "react-redux";
import { renderingCurrentUser } from "../../store/auth0Slice";

const NestedContent = ({ setIsProfileRendered, isProfileRendered }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({});
  const resource = process.env.REACT_APP_AUTH_EXT_RESOURCE;
  const [loadSpinner, setIsLoadSpinner] = useState(true);
  const auth_access_code = useSelector((store) => store.auth0Context.authorizationAccessCode);
  const renderedUser = useSelector((store) => store.auth0Context.renderingUser);
  const dispatch = useDispatch();

  const getUserProfile = async (accessToken, userId) => {
    await Axios(resource + `/users/${userId}`, "GET", null, accessToken)
      .then((userProfile) => {
        setUserProfile(userProfile);
        dispatch(renderingCurrentUser({ currentUser: JSON.stringify(userProfile) }))
        setIsProfileRendered(true);
        setIsLoadSpinner(false);
      })
      .catch((error) => {
        console.error("Error while fetching user information ::", error);
      })
      .then(() => {
        navigate(`/users/${userId}/profile`);
      })
  };

  useEffect(() => {
    const callUserProfile = async () => {
      await getUserProfile(auth_access_code, userId);
    };
    callUserProfile();
  }, [isProfileRendered]);

  useEffect(() => {
    const invoke = async () => {
      await getUserProfile(auth_access_code, userId);
    }
    invoke();
  }, [renderedUser])


  return (
    <>
      <div
        className="d-flex align-items-center pt-2 pb-2 container profileHeader"
        style={{
          backgroundColor: "rgb(204 204 204 / 18%)",
          height: "200px !important",
        }}
      >
        {loadSpinner &&
          <div className="col-12">
            <AppSpinner />
          </div>
        }
        {!loadSpinner &&
          <div className="col-2">
            <img
              src={userProfile.picture}
              alt="user profile"
              class="rounded-circle"
              width="80"
              height="80"
            />
          </div>
        }
        {!loadSpinner &&
          <div className="col-6 text-start">
            <h2 className="fw-normal">{userProfile.name}</h2>
            <h5 className="fw-light text-secondary">{userProfile.email}</h5>
            {(userProfile.blocked === true) &&
              <Button style={{ borderRadius: "15px", height: "30px" }} type="button" size="small" label="blocked" severity="danger"></Button>
            }
          </div>
        }
        {!loadSpinner &&
          <div className="text-start">
            <ToggleSelection />
          </div>
        }
      </div>
      {!loadSpinner &&
        <Tabs tabs={["Profile", "Groups", "Roles"]} />
      }
    </>
  );
};

export default NestedContent;
