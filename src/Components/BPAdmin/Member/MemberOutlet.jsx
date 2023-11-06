import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import NavTabHeader from "../../../Utils/NavTabHeader";
import MemberHeader from "./MemberHeader";
import { useSelector } from "react-redux";
import MultiSelector from "../../../Utils/MultiSelector";
import { Button } from "primereact/button";

const MemberOutlet = () => {

  const renderedUser = useSelector((store) => store?.auth0Context?.renderingUser);

  const [assignBpValue, setAssignBpValue] = useState([]);
  const assignBp = () => {
    console.log(assignBpValue, "assignBpValue");
  };
  return (
    <div>
      <MemberHeader userProfile={renderedUser} />
      <div
        className="my-3 d-flex align-items-center"
        style={{ paddingLeft: "10px" }}
      >
        <MultiSelector
          options={data}
          placeholderValue="selecte assign"
          propertyName="BPname"
          customizeTemplate={customizeTemplate}
          getSelectedValue={setAssignBpValue}
        />
        {assignBpValue?.length > 0 && (
          <Button
            className="rounded ms-3"
            style={{ background: "#0d6efd" }}
            type="button"
            onClick={assignBp}
          >
            + Assign
          </Button>
        )}
      </div>
      <NavTabHeader
        showTab={true}
        tabsHeaders={["Roles Assigned", "Roles Unassigned"]}
      />
      <Outlet />
    </div>
  );
};

export default MemberOutlet;

const data = [
  { BPname: "Australia", BPcode: "78787878787788" },
  { BPname: "Brazil", BPcode: "78787878787788" },
  { BPname: "China", BPcode: "78787878787788" },
  { BPname: "Egypt", BPcode: "78787878787788" },
  { BPname: "France", BPcode: "78787878787788" },
  { BPname: "Germany", BPcode: "78787878787788" },
  { BPname: "India", BPcode: "78787878787788" },
  { BPname: "Japan", BPcode: "78787878787788" },
  { BPname: "Spain", BPcode: "78787878787788" },
];
const customizeTemplate = (option) => {
  return (
    <div className="d-flex align-items-center">
      <img
        alt={option?.BPname}
        src="https://s.gravatar.com/avatar/603d798aca57059413a66ba0c4ed8742?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fab.png"
        className="mx-2"
        style={{
          width: "30px",
          height: "30px",
          borderRadius: "50%",
        }}
      />

      <div>
        <div>{option?.BPcode}</div>
        <div>{option?.BPname}</div>
      </div>
    </div>
  );
};
