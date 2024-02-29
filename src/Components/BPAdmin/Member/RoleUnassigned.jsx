import React, { useEffect, useState } from "react";
import NavTabBody from "../../../Utils/NavTabBody";
import NavTabTable from "../../../Utils/NavTabTable";
import { useSelector } from "react-redux";
import NavTabBodyButton from "../../../Utils/NavTabBodyButton";
import { useNavigate, useParams } from "react-router-dom";

const RoleUnassigned = () => {
  let { memberId } = useParams();
  const [isAdded, setIsAdded] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const currentSelectedUser = useSelector((store) => store.auth0Context.renderingUser);
  const userName = JSON.parse(JSON.stringify(currentSelectedUser)).name;
  const navigate = useNavigate();
  useEffect(() => {
    setIsDeleted(false);
    if (isAdded) {
      setIsAdded(false);
      if (memberId) {
        navigate(`/members/${memberId}/roles/assigned`);
      }
    };
  }, [isDeleted, isAdded]);

  return (
    <div>
      {" "}
      <div>
        <div className="container">
          <div className="d-flex justify-content-between mt-5 mb-5">
            <NavTabBody
              showDesc={true}
              description={process.env.REACT_APP_AUTH_ALLROLES_DESC}
            />
            <NavTabBodyButton
              showButton={true}
              buttonLabel={"ADD ROLE TO MEMBER"}
              isAdded={isAdded}
              setIsAdded={setIsAdded}
              isRoles={true}
              scopes={"roles"}
              dialogBoxHeader={`Add ${userName} to one or more roles`}
              isDeleted={isDeleted}
            />
          </div>
          <NavTabTable
            columns={["Name", "Application", "Description"]}
            showTable={true}
            scope={"Roles"}
            showDeleteButton={false}
            isUserAllGroups={false}
            isRoles={true}
            isUserAllRoles={true}
          />
        </div>
      </div>
    </div>
  );
};

export default RoleUnassigned;
