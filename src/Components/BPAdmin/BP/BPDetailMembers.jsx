import { SelectButton } from "primereact/selectbutton";
import React, { useEffect, useState } from "react";
import "../../Styles/BPDetailMembers.css";
import Axios from "../../../Utils/Axios";
import axios from "axios";
import { useParams } from "react-router-dom";
import DataGridTable from "../../../Utils/DataGridTable";
import AppSpinner from "../../../Utils/AppSpinner";
import { Button } from "primereact/button";
import { useDispatch, useSelector } from "react-redux";
import { addCurrentBusinessPartner, addManagementAccessToken } from "../../../store/auth0Slice";
import { assignMembersInGroup, checkUserExistsInOSC, checkUserExistsInShopify, getAllSystemGroupsFromAuth0, getCompanyContactIdInShopify, getGroupInformationAcrossSystems, getUserFieldFromAuth0, linkingCustomerWithCompany, unlinkingCustomerWithCompany, updateUserWithOSCOrganization } from "../../BusinessLogics/Logics";
import AddUser from "../../Users/AddUser";
import ImportUserModal from "../../../Utils/ImportUserModal";
import TableData from "../../../Utils/TableData";
import { Badge } from "primereact/badge";
import { ToastContainer, toast } from "react-toastify";

const BPDetailMembers = () => {
  const resourceTwo = process.env.REACT_APP_AUTH_MANAGEMENT_AUDIENCE;
  const resource = process.env.REACT_APP_AUTH_EXT_RESOURCE;
  const endpoint = process.env.REACT_APP_MANAGEMENT_API;
  const authorizationExtUrl = process.env.REACT_APP_AUTH_EXT_RESOURCE;
  const { bpId } = useParams();
  const dispatch = useDispatch();
  const auth0Context = useSelector((state) => state.auth0Context);
  const [members, setMembers] = useState([]);
  const [filterRecord, setFilteredRecord] = useState([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("InBP");
  const [message, setMessage] = useState(
    "Individually Unassign Users From This BP"
  );
  const [showOutBP, setShowOutBP] = useState(false);
  const items = [
    { name: "Members in this BP", value: "InBP" },
    { name: "All Unassigned Members", value: "OutBP" },
  ];
  const [serverPaginate, setServerPagnitae] = useState({
    start: 0,
    length: 0,
    total: -1,
    processedRecords: 0,
    users: [],
  });
  const [allGroups, setAllGroups] = useState([]);
  const [unAssignedMembers, setUnAssignedMembers] = useState([]);
  const [selectedUnassignedMembers, setSelectedUnAssignedMembers] = useState([]);
  const [isUserAdded, setIsUserAdded] = useState(false);
  const [isTokenFetched, setIsTokenFteched] = useState(false);
  const [isPasteModelShow, setIsPasteModelShow] = useState(false);
  const [isPasteCancel, setIsPasteCancel] = useState(false);
  const [isTableShow, setIsTableShow] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [isForBPScreen, setIsForBPScreen] = useState(true);

  useEffect(() => {
    setLoading(true);
    getMembersForBP(bpId);
    getMembersList(false);
  }, []);

  const filterUnassignedMembers = (members) => {
    return members.filter((member) => member?.BPID === "Unassigned");
  };
  const getRowSelected = (rowValues) => {
    setSelectedUnAssignedMembers(rowValues);
  };
  const getMembersForBP = async (bpId) => {
    if (!bpId) return;

    let url = `${resource}/groups/${bpId}/members`;
    const response = await Axios(url, "GET", null, localStorage.getItem("auth_access_token"), false, false, false);
    if (!axios.isAxiosError(response)) {
      setMembers(response?.users);
      handleUsersMapping(response?.users);
      setLoading(false);
      return response;
    } else {
      console.error("Error while getting members for a group :::", response?.cause?.message);
      setLoading(false);
      return null;
    }
  };
  const getCurrentData = async (data, action) => {
    switch (action?.toLowerCase()) {
      case "remove": {
        setLoading(true);
        await removeMemberFromCurrentBP(data.id, bpId);
        await removeContactFromCurrentStoreInOSC(data);
        await removeCustomerFromCompanyInShopify(data);
        break;
      }
      default: {
        console.log("No action triggered");
        break;
      }
    }
    await getMembersList(false);
  };
  const removeMemberFromCurrentBP = async (memberId, bpId) => {
    let url = `${resource}/groups/${bpId}/members`;
    const body = [`${memberId}`];
    const response = await Axios(url, "DELETE", body, localStorage.getItem("auth_access_token"), false, false, false);
    if (!axios.isAxiosError(response)) {
      await getMembersForBP(bpId);
      toast.success(`User unlinked from this group (Auth0) `, { theme: "colored", autoClose: 20000 })
      setLoading(false);
      return response;
    } else {
      toast.error(`Error while removing member from this group : ${response?.message}`, { theme: "colored", autoClose: 20000 });
      console.error("Error while removing member for a group :::", response?.message);
      setLoading(false);
      return null;
    }
  };
  const removeContactFromCurrentStoreInOSC = async (data) => {
    if (!data.OSCID) {
      toast.error(`Error! unable to unlink this contact with respective store. Please check this contact exists in OSC`, { theme: "colored", autoClose: 20000 });
      return;
    }
    let uatStoreOscId = Number(auth0Context?.currentBusinessPartner?.devOscId);
    let prodStoreOscId = Number(auth0Context?.currentBusinessPartner?.prodOscId);

    if (!uatStoreOscId && !prodStoreOscId) {
      toast.error(`Error! unable to unlink this contact with respective store. Please check this store exists in OSC`, { theme: "colored", autoClose: 20000 });
      return;
    }

    await handleLinkUnlinkOperationsWithOSC(false, null, data);
  };
  const removeCustomerFromCompanyInShopify = async (data) => {
    if (!data.ShopifyCustomerId) {
      toast.error(`Error! unable to unlink this customer with respective company. Please check this customer exists in shopify`, { theme: "colored", autoClose: 20000 });
      return;
    }

    let shopifyCompanyId = auth0Context?.currentBusinessPartner?.shopifyId;
    if (!shopifyCompanyId) {
      toast.error(`Error! unable to unlink this customer with respective company. Please check this company exists in shopify`, { theme: "colored", autoClose: 20000 });
      return;
    }

    await handleLinkUnlinkOperationsWithShopify(false, null, data);
  };
  const handleUsersMapping = (users) => {
    if (Array.isArray(users) && users.length > 0) {
      const actualUsers = users.map((user) => {
        return {
          id: user?.user_id,
          Name: user?.name,
          Email: user?.email,
          LatestLogin: formatTimestamp(user?.last_login),
          Logins: user?.logins_count,
          Connection: user?.identities[0]?.connection,
          OSCID: Number(user?.user_metadata?.OSCID),
          ShopifyCustomerId: Number(user?.user_metadata?.ShopifyCustomerId)
        };
      });
      setFilteredRecord(actualUsers);
    } else {
      setFilteredRecord([]);
    }
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
  const renderOutBP = (tabValue) => {
    if (typeof tabValue === "string" && tabValue === "OutBP") {
      setMessage("Relate Users To This BP");
      setShowOutBP(true);
      return;
    } else {
      setMessage("Individually Unassign Users From This BP");
      setShowOutBP(false);
      setValue("InBP");
      return;
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
  const getMembersList = async (isBpFirst) => {
    setLoading(true);
    let managementResponse = null;
    if (!auth0Context?.managementAccessToken && auth0Context?.managementAccessToken?.length === 0) {
      managementResponse = await fetchManagementToken();
    }
    let accessToken = managementResponse?.access_token ? managementResponse?.access_token : auth0Context?.managementAccessToken;
    let response = await fetchAuth0Users(100, "conception", accessToken, serverPaginate);
    const groupsResponse = await getAllAuth0Groups(response);
    if (Array.isArray(response.users) && Array.isArray(groupsResponse)) {
      const members = await filterUsersByDatabase(response.users, "conception", groupsResponse, isBpFirst);
      const assignedMembersResponse = await getMembersForBP(bpId);
      if (assignedMembersResponse?.users.length > 0) {
        const actualMembers = members.filter((member) => {
          return assignedMembersResponse?.users.every((user) => user?.user_id !== member?.id);
        });
        setUnAssignedMembers(filterUnassignedMembers(actualMembers));
      } else {
        setUnAssignedMembers(filterUnassignedMembers(members));
      }
      setAllGroups(groupsResponse);
    }
    setLoading(false);
  };
  const filterUsersBy = (bpFirst, filteredUsers, filteredUsersNotInBp) => {
    if (bpFirst) {
      return [...filteredUsers, ...filteredUsersNotInBp];
    } else {
      return [...filteredUsersNotInBp, ...filteredUsers];
    }
  };
  function hasSingleIdentityWithConnectionName(user, connectionName) {
    if (
      user &&
      user.identities &&
      Array.isArray(user.identities) &&
      user.identities.length === 1
    ) {
      return user.identities[0].connection === connectionName;
    }

    return false;
  }
  const filterUsersByDatabase = async (users, databaseName, groupsResponse, isBpFirst) => {
    if (users.length === 0) return;
    // criteria 1 : filter for Conception database
    const filteredByConceptionDatabase = users.filter((user) => {
      if (hasSingleIdentityWithConnectionName(user, databaseName)) return user;
    });

    // criteria 2 : filter for BP_
    const filteredUsers = filteredByConceptionDatabase.filter((user) =>
      user?.app_metadata?.authorization?.groups?.some((group) =>
        group.startsWith("BP_")
      )
    );

    // criteria 3 : filter for non BP_
    const filteredUsersNotInBp = filteredByConceptionDatabase.filter(
      (user) =>
        !user?.app_metadata?.authorization?.groups?.some((group) =>
          group.startsWith("BP_")
        )
    );

    let clubedUsers = filterUsersBy(isBpFirst, filteredUsers, filteredUsersNotInBp);

    if (Array.isArray(clubedUsers)) {
      // setActualMembers(clubedUsers);
      const members = clubedUsers.map((filteredUser) => {
        let indexOfBpGroup = -1;
        filteredUser?.app_metadata?.authorization?.groups?.forEach(
          (group, index) => {
            if (String(group).startsWith("BP_")) {
              indexOfBpGroup = index;
            }
          }
        );
        return {
          id: filteredUser.user_id,
          Connection: databaseName,
          Name: filteredUser.name,
          Email: filteredUser.email,
          LatestLogin: formatTimestamp(filteredUser.last_login),
          Logins: filteredUser.logins_count,
          BPID: filteredUser?.app_metadata?.authorization?.groups[indexOfBpGroup] &&
            filteredUser?.app_metadata?.authorization?.groups[
              indexOfBpGroup
            ].substring(3).length == 10
            ? filteredUser?.app_metadata?.authorization?.groups[
              indexOfBpGroup
            ].substring(3)
            : "Unassigned",
          BPName: groupsResponse?.filter(
            (group) =>
              group?.groupName ===
              filteredUser?.app_metadata?.authorization?.groups[indexOfBpGroup]
          )[0]
            ? groupsResponse?.filter(
              (group) =>
                group?.groupName ===
                filteredUser?.app_metadata?.authorization?.groups[
                indexOfBpGroup
                ]
            )[0]?.groupDescription
            : "-",
          OSCID: filteredUser?.user_metadata?.OSCID,
          ShopifyId: filteredUser?.user_metadata?.ShopifyCustomerId
        };
      });

      return members;
    }
  };
  const getAllAuth0Groups = async () => {
    let url = `${authorizationExtUrl}/groups`;
    const response = await getAllSystemGroupsFromAuth0(
      url,
      localStorage.getItem("auth_access_token")
    );
    if (response) {
      const filteredResponse = response?.groups
        ?.filter((group) => String(group?.name).includes("BP_"))
        .map((group) => {
          return {
            groupId: group?._id,
            groupName: group?.name,
            groupDescription: group?.description,
          };
        });
      return filteredResponse;
    }
  };
  const fetchAuth0Users = async (perPage, database, managementAccessToken, serverPaginate) => {
    if (serverPaginate.processedRecords === serverPaginate.total) {
      return serverPaginate;
    }

    let url = `${resourceTwo}users?per_page=${perPage}&include_totals=true&connection=${database}&search_engine=v3&page=${serverPaginate.start}`;

    const response = await Axios(url, "get", null, managementAccessToken, false);

    const updatedServerPaginate = {
      start: serverPaginate.start + 1,
      length: response?.length,
      total: response?.total,
      processedRecords: serverPaginate.processedRecords + response?.length,
      users: [...serverPaginate?.users, ...response?.users],
    };

    setServerPagnitae(updatedServerPaginate);

    // recursive call
    return await fetchAuth0Users(
      perPage,
      database,
      managementAccessToken,
      updatedServerPaginate
    );
  };
  const assignMembersIntoGroup = async () => {
    let data = [];
    selectedUnassignedMembers.map((unAssignedMember) => {
      data?.push(unAssignedMember?.id);
    });
    let response = await assignMembersInGroup(bpId, data);
    if (response === "200") {
      await getMembersList(false);
      toast.success(`Member${selectedUnassignedMembers?.length === 1 ? "" : "'s"} linked to the group`, { theme: "colored", autoClose: 20000 });
    } else {
      toast.error(response, { theme: "colored", autoClose: 20000 });
    }
    setSelectedUnAssignedMembers([]);
  };
  const getMemberDetail = async (memberDetail) => {

    let data = [memberDetail?.user_id];
    let response = await assignMembersInGroup(bpId, data);
    if (response === "200") {
      await getMembersList(false);
      toast.success(`Member successfully added in Auth0`, { theme: "colored", autoClose: 20000 });
    } else {
      toast.error(response, { theme: "colored", autoClose: 20000 });
    }

    if (isForBPScreen) {
      if (memberDetail?.user_id) {
        const userField = await getUserFieldFromAuth0(memberDetail?.user_id, "email,user_metadata", auth0Context?.managementAccessToken);
        let usersInfo = [];
        let unassignedUserInfo = Object.assign({});
        unassignedUserInfo['OSCID'] = userField?.user_metadata?.OSCID;
        unassignedUserInfo['ShopifyCustomerId'] = userField?.user_metadata?.ShopifyCustomerId;
        unassignedUserInfo['Email'] = userField?.email;
        usersInfo?.push(unassignedUserInfo);
        await handleLinkUnlinkOperationsWithOSC(isForBPScreen, usersInfo, null);
        await handleLinkUnlinkOperationsWithShopify(isForBPScreen, usersInfo, null);
      }
    }
  };
  const getMembersIdFromTable = async (getmembersId) => {

    let data = [];
    getmembersId.map((memberId) => {
      data?.push(memberId);
    });
    let response = await assignMembersInGroup(bpId, data);
    if (response === "200") {
      await getMembersList(false);
      toast.success(`Member${data?.length === 1 ? "" : "'s"} successfully added`, { theme: "colored", autoClose: 20000 });
    } else {
      toast.error(response, { theme: "colored", autoClose: 20000 });
    }
  };
  const handleAssignMembersIntoGroup = async () => {
    await assignMembersIntoGroup();
    await mapUsersWithOSCStore();
    await mapUsersWithShopifyCompany();
  };
  const mapUsersWithOSCStore = async () => {
    let usersInfo = [];
    selectedUnassignedMembers.map((unAssignedMember) => {
      if (unAssignedMember?.OSCID) {
        let unassignedUserInfo = Object.assign({});
        unassignedUserInfo['OSCID'] = unAssignedMember?.OSCID;
        unassignedUserInfo['Email'] = unAssignedMember?.Email;
        usersInfo?.push(unassignedUserInfo);
      }
    });

    if (usersInfo.length === 0) {
      toast.error(`Error! unable to link this ${selectedUnassignedMembers.length == 1 ? 'contact' : 'contacts'} with respective store. Please check selected ${selectedUnassignedMembers.length == 1 ? 'contact' : 'contacts'} exists in OSC`, { theme: "colored", autoClose: 20000 });
      return;
    }

    let uatStoreOscId = Number(auth0Context?.currentBusinessPartner?.devOscId);
    let prodStoreOscId = Number(auth0Context?.currentBusinessPartner?.prodOscId);

    if (!uatStoreOscId && !prodStoreOscId) {
      toast.error(`Error! unable to link this ${selectedUnassignedMembers.length == 1 ? 'contact' : 'contacts'} with respective store. Please check this store exists in OSC`, { theme: "colored", autoClose: 20000 });
      return;
    }

    await handleLinkUnlinkOperationsWithOSC(true, usersInfo, null);
  };
  const handleLinkUnlinkOperationsWithOSC = async (isForLinking, usersInfo = null, userInfo = null) => {
    if (isForLinking) {
      const result = await linkingUsersWithOSCStore(usersInfo);
      if (result === true) {
        toast.success(`${usersInfo.length == 1 ? 'User' : 'Users'} linked to osc store`, { theme: "colored", autoClose: 20000 });
      }
    } else {
      await unlinkingUserWithOSCStore(userInfo).finally(() => {
        toast.success(`User unlinked from osc store`, { theme: "colored", autoClose: 20000 });
      });
    }
  };
  const linkingUsersWithOSCStore = async (usersInfo) => {

    let uatStoreOscId = Number(auth0Context?.currentBusinessPartner?.devOscId);
    let prodStoreOscId = Number(auth0Context?.currentBusinessPartner?.prodOscId);
    let isInOSCDev = (auth0Context?.currentBusinessPartner?.IsInOSCDev == "Yes") ? true : false;
    let isInOSCProd = (auth0Context?.currentBusinessPartner?.IsInOSCProd == "Yes") ? true : false;
    try {

      for (let user in usersInfo) {
        let email = usersInfo[user]?.Email;
        let oscContactId = usersInfo[user]?.OSCID;

        if (auth0Context?.currentBusinessPartner?.IsOSCStoreInBothSystem) {
          const uatResponse = await checkUserExistsInOSC(false, email);// for uat
          if (Number.isInteger(Number(uatResponse))) {
            await updateUserWithOSCOrganization(oscContactId, uatStoreOscId, false, false);// for UAT (TEST)
          }
          const prodResponse = await checkUserExistsInOSC(true, email);// for prod
          if (Number.isFinite(Number(prodResponse))) {
            await updateUserWithOSCOrganization(oscContactId, prodStoreOscId, false, true); // for PROD
          }
        }

        if (isInOSCDev) {
          const uatResponse = await checkUserExistsInOSC(false, email);// for uat
          if (Number.isInteger(Number(uatResponse))) {
            await updateUserWithOSCOrganization(oscContactId, uatStoreOscId, false, false);// for UAT (TEST)
          }
        }

        if (isInOSCProd) {
          const prodResponse = await checkUserExistsInOSC(true, email);// for prod
          if (Number.isFinite(Number(prodResponse))) {
            await updateUserWithOSCOrganization(oscContactId, prodStoreOscId, false, true); // for PROD
          }
        }
      }
      return true;
    } catch (error) {
      console.error("Error while linking users with OSC:", error);
      toast.error(`Failed to link ${usersInfo.length == 1 ? 'user' : 'users'} to OSC Store`, { theme: "colored", autoClose: 20000 });
      return false;
    }
  };
  const unlinkingUserWithOSCStore = async (currentUserData) => {

    let uatStoreOscId = Number(auth0Context?.currentBusinessPartner?.devOscId);
    let prodStoreOscId = Number(auth0Context?.currentBusinessPartner?.prodOscId);
    let isInOSCDev = (auth0Context?.currentBusinessPartner?.IsInOSCDev == "Yes") ? true : false;
    let isInOSCProd = (auth0Context?.currentBusinessPartner?.IsInOSCProd == "Yes") ? true : false;
    let oscContactId = currentUserData?.OSCID;

    if (auth0Context?.currentBusinessPartner?.IsOSCStoreInBothSystem) {
      const uatResponse = await checkUserExistsInOSC(false, currentUserData?.Email);// for uat
      if (Number.isInteger(Number(uatResponse))) {
        await updateUserWithOSCOrganization(oscContactId, uatStoreOscId, true, false);// for UAT (TEST)
      }
      const prodResponse = await checkUserExistsInOSC(true, currentUserData?.Email);// for prod
      if (Number.isFinite(Number(prodResponse))) {
        await updateUserWithOSCOrganization(oscContactId, prodStoreOscId, true, true); // for PROD
      }
      return;
    }


    if (isInOSCDev) {
      const uatResponse = await checkUserExistsInOSC(false, currentUserData?.Email);// for uat
      if (Number.isInteger(Number(uatResponse))) {
        await updateUserWithOSCOrganization(oscContactId, uatStoreOscId, true, false);// for UAT (TEST)
      }
      return;
    }


    if (isInOSCProd) {
      const prodResponse = await checkUserExistsInOSC(true, currentUserData?.Email);// for prod
      if (Number.isFinite(Number(prodResponse))) {
        await updateUserWithOSCOrganization(oscContactId, prodStoreOscId, true, true); // for PROD
      }
      return;
    }
  };
  const mapUsersWithShopifyCompany = async () => {
    let usersInfo = [];
    selectedUnassignedMembers.map((unAssignedMember) => {
      if (unAssignedMember?.ShopifyId) {
        let unassignedUserInfo = Object.assign({});
        unassignedUserInfo['ShopifyId'] = unAssignedMember?.ShopifyId;
        unassignedUserInfo['Email'] = unAssignedMember?.Email;
        usersInfo?.push(unassignedUserInfo);
      }
    });

    if (usersInfo.length === 0) {
      toast.error(`Error! unable to link this ${selectedUnassignedMembers.length == 1 ? 'customer' : 'customers'} with respective store. Please check selected ${selectedUnassignedMembers.length == 1 ? 'customer' : 'customers'} exists in shopify`, { theme: "colored", autoClose: 20000 });
      return;
    }

    let shopifyCompanyId = auth0Context?.currentBusinessPartner?.shopifyId;
    if (!shopifyCompanyId) {
      toast.error(`Error! unable to link this ${selectedUnassignedMembers.length == 1 ? 'customer' : 'customers'} with respective Company. Please check this company exists in shopify`, { theme: "colored", autoClose: 20000 });
      return;
    }


    await handleLinkUnlinkOperationsWithShopify(true, usersInfo, null);
  };
  const handleLinkUnlinkOperationsWithShopify = async (isForLinking, usersInfo = null, userInfo = null) => {
    if (isForLinking) {
      const result = await linkingUsersWithShopify(usersInfo);
      if (result) {
        toast.success(`${usersInfo.length == 1 ? 'user' : 'users'} linked to shopify company`, { theme: "colored", autoClose: 20000 });
        return;
      } else {
        toast.error(`Error while linking ${usersInfo.length == 1 ? 'user' : 'users'} to the company in shopify`, { theme: "colored", autoClose: 20000 });
        return;
      }
    } else {
      await unlinkingUserWithShopify(userInfo);
      toast.success(`User unlinked from shopify company`, { theme: "colored", autoClose: 20000 });
    }
  };
  const linkingUsersWithShopify = async (usersInfo) => {
    if (usersInfo.length === 0)
      return false;

    try {
      for (let user of usersInfo) {

        let email = user?.Email;
        const id = await checkUserExistsInShopify(email);
        let shopifyCustomerId = `gid://shopify/Customer/${id}`;
        let shopifyCompanyId = auth0Context?.currentBusinessPartner?.shopifyId;
        const linkedResponse = await linkingCustomerWithCompany(shopifyCompanyId, shopifyCustomerId);
        if (!linkedResponse)
          return false;
        console.log(`linked response for ${shopifyCompanyId} & ${shopifyCustomerId} is ${linkedResponse}`);
      }
      return true;
    }
    catch (error) {
      console.error("Error while linking users with Shopify:", error);
      toast.error(`Failed to link ${usersInfo.length == 1 ? 'user' : 'users'} to Shopify company`, { theme: "colored", autoClose: 20000 });
      return false;
    }

  };
  const unlinkingUserWithShopify = async (userInfo) => {
    let id = userInfo?.ShopifyCustomerId;
    let shopifyCustomerId = `gid://shopify/Customer/${id}`;
    const companyContactResponse = await getCompanyContactIdInShopify(shopifyCustomerId);
    if (Array.isArray(companyContactResponse) && companyContactResponse.length !== 0) {
      const result = companyContactResponse[0];
      let companyContactId = result?.id;
      const isUnlinked = await unlinkingCustomerWithCompany(companyContactId);
      console.log(`unlinked response for ${companyContactId} ${shopifyCustomerId} is ${isUnlinked}`);
    }
  };

  const fetchCurrentBusinessPartnerInformation = async (bpId) => {
    try {
      const response = await getGroupInformationAcrossSystems(bpId);
      dispatch(addCurrentBusinessPartner({ businessPartner: response }))
    }
    catch (ex) {
      console.error("Error :", ex);
    }

  };

  useEffect(() => {
    if (value === "OutBP") {
      setSelectedUnAssignedMembers([]);
    }
    renderOutBP(value);
  }, [value]);

  useEffect(() => {
    if (typeof auth0Context?.currentBusinessPartner === "object" && Object.keys(auth0Context?.currentBusinessPartner).length === 0) {
      // current business partner is not in the redux store so need to adding current business partner to the system
      fetchCurrentBusinessPartnerInformation(bpId);
      return;
    }
  }, [auth0Context?.currentBusinessPartner]);

  return (
    <>
      <div
        className="text-start"
      // style={{ marginTop: "30px", position: "relative", right: "465px" }}
      >
        <div
          className="mt-3"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
          }}
        >
          {/*  mt-3" ; */}
          <SelectButton
            value={value}
            onChange={(e) => setValue(e.value)}
            optionLabel="name"
            options={items}
          />
          {showOutBP && (
            <>
              {selectedUnassignedMembers?.length === 0 ? (
                <div className="me-3">
                  {" "}
                  <div>
                    <AddUser
                      buttonLabel="Member"
                      setIsUserAdded={setIsUserAdded}
                      isTokenFetched={isTokenFetched}
                      setIsPasteModelShow={setIsPasteModelShow}
                      isPasteCancel={isPasteCancel}
                      setIsPasteCancel={setIsPasteCancel}
                      getMemberDetail={getMemberDetail}
                      isForMember={true}
                      isForBPScreen={isForBPScreen}
                    />
                  </div>
                  <div>
                    <ImportUserModal
                      action="Add_User"
                      isPasteModelShow={isPasteModelShow}
                      setIsPasteCancel={setIsPasteCancel}
                      setTableData={setTableData}
                      setIsTableShow={setIsTableShow}
                    />
                  </div>
                  <div>
                    <TableData
                      columnType={"user"}
                      data={tableData}
                      isTableShow={isTableShow}
                      setIsTableShow={setIsTableShow}
                      setTableData={setTableData}
                      setIsPasteModelShow={setIsPasteModelShow}
                      setIsPasteCancel={setIsPasteCancel}
                      getMembersIdFromTable={getMembersIdFromTable}
                      isForMember={true}
                    />
                  </div>
                </div>
              ) : (
                <div className="position-relative">
                  <Button
                    type="button"
                    label={
                      selectedUnassignedMembers?.length === 1
                        ? "Assign Member"
                        : "Assign Member's"
                    }
                    icon="pi pi-users"
                    style={{
                      borderRadius: "7px",
                      marginRight: "30px",
                    }}
                    onClick={() => {
                      handleAssignMembersIntoGroup();
                    }}
                  ></Button>
                  <Badge
                    style={{
                      position: "absolute",
                      right: "12px ",
                      top: "-14px",
                      fontSize: "12px",
                      background: "#1a9e86",
                    }}
                    value={selectedUnassignedMembers?.length}
                    severity="success"
                  ></Badge>
                </div>
              )}
            </>
          )}
        </div>
        <div className="text-center">{loading && <AppSpinner />}</div>
        {!loading && (
          <div>
            <p
              className="pMessage fw-light"
              style={{ color: "rgb(114, 114, 114)" }}
            >
              {message}
            </p>
          </div>
        )}
      </div>
      <div>
        <div style={{ position: "relative", left: "467px !important" }}>
          {!loading && !showOutBP && (
            <DataGridTable
              data={filterRecord}
              rowHeader={[
                "Name",
                "Email",
                "Latest Login",
                "Logins",
                "Connection",
                "Action",
              ]}
              getCurrentData={getCurrentData}
              loading={loading}
              action={true}
              showTrashOnly={true}
              emptyMessage={"No Members Found."}
              isAbleToSelect={true}
            />
          )}
          {!loading && showOutBP && (
            <>
              {/* <p>All Unassigned members goes here...</p> */}
              <DataGridTable
                data={unAssignedMembers}
                rowHeader={[
                  "Name",
                  "Email",
                  "Latest Login",
                  "Logins",
                  "Connection",
                ]}
                getCurrentData={getCurrentData}
                getRowSelected={getRowSelected}
                loading={loading}
                action={false}
                showTrashOnly={true}
                emptyMessage={"No Members Found."}
                isCheckbox={true}
                isAbleToSelect={true}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BPDetailMembers;
