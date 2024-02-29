/* eslint-disable no-useless-concat */
import React, { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";

function NavTabHeader({ showTab, tabsHeaders, defultValue = [] }) {

  const navigate = useNavigate();
  const location = useLocation();
  const handleNavigation = (header) => {
    switch (header.toLowerCase()) {
      case "groups": {
        navigate("show");
        break;
      }
      case "roles": {
        navigate("show");
        break;
      }
      case "rolesassigned": {
        navigate("roles/assigned");
        break;
      }
      case "rolesunassigned": {
        navigate("roles/unassigned");
        break;
      }
      default: {
        navigate(`${header.toLowerCase()}`);
      }
    }
  };
  const toButtonActive = (locationPath, index) => {
    let className = "";
    let path = locationPath?.pathname?.split("/");
    if (path?.length === 0 || !path) {
      return className
    }
    console.log(defultValue?.findIndex(_ => _ == path[path?.length - 1]), "indexxxxx");
    if (
      defultValue?.findIndex(_ => _ == path[path?.length - 1]) == index
    ) {
      className = "active";
    }
    return className;
  }
  return (
    <div className="container mt-4">
      {showTab && (
        <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
          {tabsHeaders.map((header, index) => {
            return (
              <li class="nav-item" role="presentation" key={index + 1}>
                <button
                  className={`nav-link btn-primary ${toButtonActive(location, index)}`}
                  // className={
                  //   `${index === 0
                  //     ? "nav-link active btn-primary "
                  //     : "nav-link  btn-primary"
                  //   }` + "text-decoration-none"
                  // }
                  // id="pills-home-tab"
                  // data-bs-toggle="pill"
                  // data-bs-target="#pills-home"
                  // type="button"
                  // role="tab"
                  // aria-controls="pills-home"
                  // aria-selected="true"
                  onClick={() => {
                    handleNavigation(header.trim().split(" ").join(""));
                  }}
                >
                  {header}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default NavTabHeader;
