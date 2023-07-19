import React, { useState } from "react";
import ContentHeader from "../Contents/ContentHeader";
import ContentBody from "../Contents/ContentBody";
import AddUser from "../Users/AddUser";

const ContentOutlet = () => {
  const [isUserAdded, setIsUserAdded] = useState(false);
  return (
    <div>
      <ContentHeader
        title="Users"
        description="Open a user to add them to a group or assign them to a role"
      />
      <AddUser setIsUserAdded={setIsUserAdded} />
      <ContentBody isUserAdded={isUserAdded} />
    </div>
  );
};

export default ContentOutlet;
