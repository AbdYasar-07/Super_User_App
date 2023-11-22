import axios from "axios";
import Axios from "../../Utils/Axios";
import { error } from "jquery";



export const roleFilter = (data, condition) => {
  if (data?.length > 0) {
    data = data?.filter((ele) => ele?.name?.includes(condition));
  }
  return data;
};
export const groupFilter = (data, condition) => {
  if (data?.length > 0) {
    data = data?.filter((ele) => ele?.name?.includes(condition));
  }
  return data;
};
export const toMapApplicationNames = (data, clientsinfo) => {
  data?.forEach((ele, index) => {
    let foundedValue = clientsinfo?.find(
      (clientsData) => clientsData?.client_id === ele?.applicationId
    );
    if (foundedValue) {
      data[index]["applicationName"] = foundedValue?.name;
    }
  });
  if (data.length > 0) {
    return data;
  }
};
export const getOSCStoreIDByBPCode = async (bpCode) => {
  const body = JSON.stringify({
    id: 107164,
    filters: [
      {
        name: "SAP BP Code",
        values: `${bpCode}`,
      },
    ],
  });
  const url = "https://service-staging.carrier.com.ph/services/rest/connect/v1.4/analyticsReportResults";
  const response = await Axios(url, "POST", body, null, false, true);
  if (!axios.isAxiosError(response)) {
    return response;
  } else {
    console.error("Error :::", response.cause);
  }
};
export const getAllSystemGroupsFromAuth0 = async (url, accessToken) => {

  if (!url || !accessToken)
    return;

  const response = await Axios(url, 'GET', null, accessToken, false, null);
  if (!axios.isAxiosError(response)) {
    return response;
  } else {
    console.error("Erro while getting groups from the Auth0 system :::", response?.message);
    return null;
  }

};
export const getShopifyCompaniesId = async () => {
  let data = JSON.stringify({
    query: `query GetThat {
    companies(first: 100) {
      edges {
        node {
          id
          name
          externalId
        }
      }
    }
  }`,
    variables: {}
  });
  let url = `https://phoenix-ph.myshopify.com/admin/api/2023-07/graphql.json`;
  const response = await Axios(url, 'POST', data, null, true, false, true);
  if (!axios.isAxiosError(response)) {
    return response;
  } else {
    console.error("Error while getting shopify company inforamtion :::", response?.message);
    return null;
  }
};
export const createUserInShopifySystem = async (user) => {
  let data = JSON.stringify({
    "customer": {
      "first_name": user.name,
      "last_name": user.nickname,
      "email": user.email,
      "verified_email": user?.verifiedEmail
    }
  });
  let url = `https://phoenix-ph.myshopify.com/admin/api/2023-07/customers.json`;
  const response = await Axios(url, 'POST', data, null, true, false, true);
  if (!axios.isAxiosError(response)) {
    return response;
  } else {
    if (response?.response?.data['errors']['email']) {
      console.error("Error while creating an user in shopify :::", 'email', response?.response?.data['errors']['email'][0]);
      return `email ${response?.response?.data['errors']['email'][0]}`;
    } else {
      console.error("Error while creating an user in shopify :::", response?.message[0]);
      return response?.message;
    }
  }
};
export const updateUserInShopify = async (user, shopifyCustomerId) => {
  let body = {
    "customer": {
      "first_name": user.name,
      "last_name": user.nickname,
      "email": user.email,
      "verified_email": user?.verifiedEmail
    }
  };
  let url = `https://phoenix-ph.myshopify.com/admin/api/2023-07/customers/${shopifyCustomerId}.json`;
  const response = await Axios(url, 'PUT', body, null, true, false, true);
  if (!axios.isAxiosError(response)) {
    console.log("Updated user response from shopify :::", response);
    return response;
  } else {
    console.error("Error while updating user in shopify :::", response?.message);
    return null;
  }
};
export const checkUserExistsInShopify = async (userEmail) => {
  let url = `https://phoenix-ph.myshopify.com/admin/api/2023-07/customers/search.json?query=email:${userEmail}`;
  const response = await Axios(url, 'GET', null, null, true, false, true);
  if (!axios.isAxiosError(response)) {
    return response.customers[0] ? response.customers[0]?.id : false;
  } else {
    console.error("Error while checking user in shopify :::", response?.message);
    return null;
  }
};
export const updateUserInAuth0 = async (url, userId, body, token) => {
  let endpoint = `${url}users/${userId}`;
  const response = await Axios(endpoint, 'PATCH', body, token, true, null, null);
  if (!axios.isAxiosError(response)) {
    return true;
  } else {
    console.error("Error while updating user information in Auth0 system :::", response?.message);
    return false;
  }
};
export const checkUserExistsInOSC = async (userEmail) => {

  if (!userEmail)
    return;

  const url = "https://service-staging.carrier.com.ph/services/rest/connect/v1.4/analyticsReportResults";
  let data = JSON.stringify({
    "id": Number(process.env.REACT_APP_OSC_KEY),
    "filters": [
      {
        "name": "Type",
        "values": ""
      },
      {
        "name": "Email",
        "values": `${userEmail}`
      }
    ]
  });
  const response = await Axios(url, 'POST', data, null, false, true, null);
  if (!axios.isAxiosError(response)) {
    return response?.count > 0;
  } else {
    console.error("Error while searching contact in OSC :::", response.message);
    return null;
  }
};
export const createUserInOSCSystem = async (user) => {
  let url = 'https://service-staging.carrier.com.ph/services/rest/connect/v1.4/contacts';
  let data = JSON.stringify({
    "name": {
      "first": user?.name,
      "last": user?.name
    },
    "emails": {
      "address": user?.email,
      "addressType": {
        "id": 0
      }
    },
    "customFields": {
      "c": {
        "verified": false,
        "type": {
          "id": 98
        },
        "source": {
          "id": 140 // creating from super user app
        }
      }
    }
  });

  const response = await Axios(url, 'POST', data, null, false, true, false);
  if (!axios.isAxiosError(response)) {
    console.log("user creation response in osc ****", response);
    return response;
  } else {
    console.error("Error while creating contact in OSC :::", response?.message);
    return null;
  }
};
export const getUserFieldFromAuth0 = async (userId, field, managementToken) => {
  let url = `https://dev-34chvqyi4i2beker.jp.auth0.com/api/v2/users/${userId}?fields=${field}`;
  const response = await Axios(url, 'GET', null, managementToken, true, false, false);
  if (!axios.isAxiosError(response)) {
    console.log("user info from auth0 ::", response);
    return response;
  } else {
    console.error("Error while retriving user info from Auth0 system :::", response?.message);
  }
};

export const assignMembersInGroup = async (bpId,memberIds) => {
  const resource = process.env.REACT_APP_AUTH_EXT_RESOURCE;
  const response = await Axios(
    resource + `/groups/${bpId}/members`,
    "PATCH",
    memberIds,
    localStorage.getItem("auth_access_token")
  )
  if (!axios.isAxiosError(response)) {
    return "200";
  } else {
    console.error("Error while assign member into group info from Auth0 system :::", response?.message);
    return `Error while assign member${memberIds?.length===1?"":"'s"} into BP, ${response?.message}`
  }
};