import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accessToken: "",
  idToken: "",
  permissions: [],
  roles: [],
  groups: [],
  authorizationAccessCode: "",
  conceptionDatabase: []
};

const auth0Slice = createSlice({
  name: "auth0Context",
  initialState,
  reducers: {
    addUserInfo(state, action) {
      state.accessToken = action.payload.accessToken;
      state.idToken = action.payload.idToken;
      state.groups = action.payload.groups;
      state.roles = action.payload.roles;
      state.permissions = action.payload.permissions;
    },
    addAuthorizationCode(state, action) {
      state.authorizationAccessCode = action.payload.code;
    },
    addConceptionDatabase(state, action) {
      state.conceptionDatabase = action.payload.conception;
    },
    clearState(state, action) {
      state.accessToken = "";
      state.idToken = "";
      state.groups = [];
      state.roles = [];
      state.permissions = [];
      state.authorizationAccessCode = "";
      state.conceptionDatabase = [];
    },
  },
});

export const { addUserInfo, addAuthorizationCode, addConceptionDatabase, clearState } =
  auth0Slice.actions;
export default auth0Slice.reducer;
