import axios from "axios";
import Axios from "../../Utils/Axios";



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
    console.error("Erro while getting groups from the Auth0 system :::", response?.cause?.message);
    return null;
  }

}
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
    console.error("Error while getting shopify company inforamtion :::", response?.cause?.message);
    return null;
  }

}
