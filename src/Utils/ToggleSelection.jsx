import React, { useEffect, useState } from 'react';
import { SelectButton } from 'primereact/selectbutton';
import "../Components/Styles/ToggleSelection.css"
import { useDispatch, useSelector } from 'react-redux';
import Axios from "../Utils/Axios";
import { ToastContainer, toast } from 'react-toastify';
import { renderingCurrentUser } from '../store/auth0Slice';



const ToggleSelection = () => {

    const resource = process.env.REACT_APP_AUTH_MANAGEMENT_AUDIENCE;
    const resourceUrlForManagementToken = process.env.REACT_APP_MANAGEMENT_API;
    const options = ['Block User', 'Unblock User'];
    const userInfo = useSelector((store) => store.auth0Context);
    const renderedUser = useSelector((store) => store.auth0Context.renderingUser);
    const [value, setValue] = useState(options[`${JSON.parse(renderedUser).blocked === true ? 1 : 0}`]);
    const dispatch = useDispatch();

    useEffect(() => {
        if (JSON.parse(renderedUser).blocked) {
            setValue(options[0]);
        } else {
            setValue(options[1]);
        }
    }, []);


    const getAuthToken = async () => {
        let body = {
            client_id: process.env.REACT_APP_AUTH_MANAGEMENT_CLIENT_ID,
            client_secret: process.env.REACT_APP_AUTH_MANAGEMENT_CLIENT_SECRET,
            audience: process.env.REACT_APP_AUTH_MANAGEMENT_AUDIENCE,
            grant_type: process.env.REACT_APP_AUTH_GRANT_TYPE,
        };
        return await Axios(
            `${resourceUrlForManagementToken}`,
            "POST",
            body,
            null
        )
            .then((managementToken) => {
                return managementToken;
            })
            .catch((error) => {
                return `Error ::", ${error}`;
            });
    };

    const handleToggleState = async (value) => {
        switch (value) {
            case "Block User":
                await blockUserHelper(userInfo.idToken.sub, true);
                setValue(value);
                break;
            case "Unblock User":
                await blockUserHelper(userInfo.idToken.sub, false);
                setValue(value);
                break;
            default:
                break;
        }
    }

    const blockUser = async (userId, access_token, status) => {
        if (!userId)
            return;

        await Axios(`${resource}users/${userId}`, 'PATCH', { "blocked": status }, access_token, true)
            .then((response) => {
                dispatch(renderingCurrentUser({ currentUser: JSON.stringify(response) }));
                toast.success(`User ${userInfo.idToken.email} has been ${status === true ? 'blocked' : 'unblocked'}`, { theme: "colored" });
            })
            .catch((error) => {
                console.error("Error while updating user block status");
            })
    }

    const blockUserHelper = async (userId, status) => {

        if (renderedUser.blocked === true) {
            toast.warn(`User ${renderedUser.email} already blocked`, { theme: "colored" })
            return;
        }

        await getAuthToken().then(async (managementResponse) => {
            await blockUser(userId, managementResponse.access_token, status);
        })
    }



    return (
        <>
            <ToastContainer />
            <div className='selectToggle'>
                <SelectButton value={value} onChange={(e) => handleToggleState(e.value)} options={options} checked />
            </div>
        </>
    );
}

export default ToggleSelection;
