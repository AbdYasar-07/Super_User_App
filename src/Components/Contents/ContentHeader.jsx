import React from "react";

const ContentHeader = ({ title, description }) => {
  return (
    <div className="container text-start">
      <h1 className="fw-normal">{title}</h1>
      <h5 className="fw-light mt-3" style={{ color: "rgb(114 114 114)" }}>
        {description}
      </h5>
    </div>
  );
};

export default ContentHeader;
