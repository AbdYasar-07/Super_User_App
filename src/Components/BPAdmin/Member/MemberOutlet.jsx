import React from "react";
import { Outlet } from "react-router-dom";
import NavTabHeader from "../../../Utils/NavTabHeader";
import MemberHeader from "./MemberHeader";
import { useSelector } from "react-redux";

const MemberOutlet = () => {

  const renderedUser = useSelector((store) => store?.auth0Context?.renderingUser);

  return (
    <div>
      <MemberHeader userProfile={renderedUser} />
      <NavTabHeader
        showTab={true}
        tabsHeaders={["Roles Assigned", "Roles Unassigned"]}
      />
      <Outlet />
    </div>
  );
};

export default MemberOutlet;
