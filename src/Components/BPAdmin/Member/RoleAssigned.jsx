import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import NavTabBody from "../../../Utils/NavTabBody";
import NavTabBodyButton from "../../../Utils/NavTabBodyButton";
import NavTabTable from "../../../Utils/NavTabTable";

const RoleAssigned = () => {
  const [isAdded, setIsAdded] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const currentSelectedUser = useSelector(
    (store) => store.auth0Context.renderingUser
  );
  const userName = JSON.parse(JSON.stringify(currentSelectedUser)).name;

  useEffect(() => {
    setIsDeleted(false);
    if (isAdded) setIsAdded(false);
  }, [isDeleted, isAdded]);

  return (
    <div>
      <div className="container">
        <div className="d-flex justify-content-between mt-5 mb-5">
          <NavTabBody
            showDesc={true}
            description={process.env.REACT_APP_AUTH_ROLES_DESC}
          />
          <NavTabBodyButton
            showButton={true}
            buttonLabel={"ADD ROLE TO MEMBER"}
            isAdded={isAdded}
            setIsAdded={setIsAdded}
            isRoles={true}
            scopes={"roleF"}
            dialogBoxHeader={`Add ${userName} to one or more roles`}
            isDeleted={isDeleted}
          />
        </div>
        <NavTabTable
          columns={["Name", "Application", "Description", "Remove"]}
          showTable={true}
          isAdded={isAdded}
          setIsAdded={setIsAdded}
          showDeleteButton={true}
          scope={"Roles"}
          isDeleted={isDeleted}
          setIsDeleted={setIsDeleted}
          isRoles={true}
          isUserAllGroups={false}
          isUserAllRoles={false}
        />
      </div>
    </div>
  );
};

export default RoleAssigned;
