import React from "react";
import { Outlet } from "react-router-dom";
import NestedContent from "../../Contents/NestedContents";
import NavTabHeader from "../../../Utils/NavTabHeader";

const MemberOutlet = (setIsProfileRendered) => {
  return (
    <div>
      <NestedContent
        setIsProfileRendered={setIsProfileRendered}
        tabHeader={[]}
      />
      <NavTabHeader
        showTab={true}
        tabsHeaders={["Roles Assigned", "Roles Unassigned"]}
      />
      <Outlet />
    </div>
  );
};

export default MemberOutlet;
