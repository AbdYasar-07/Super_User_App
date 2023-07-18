import React, { useEffect, useState } from "react";
import Axios from "../../Utils/Axios";
function AddUser({ setIsUserAdded }) {
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUsername] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [listOfConnnection, setlistOfConnnection] = useState([]);
  const [databaseConnection, setDatabaseConnection] = useState("");
  const [validation, setValidation] = useState(false);
  const [emailValidation, setEmailValidation] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState(false);
  const initializeFileds = () => {
    setValidation(false);
    setEmailValidation(false);
    setPasswordValidation(false);
    setUserEmail("");
    setUsername("");
    setlistOfConnnection(listOfConnnection);
    setUserPassword("");
    setDatabaseConnection("");
    setRepeatPassword("");
  };
  const getUserToken = () => {
    let body = {
      client_id: "p4sZ4mRoyx3jhkH7AdYU63m7JWxVqjQP",
      client_secret:
        "MhvB9WLvhsGa5NNWQaetTaOTTXqx4Nk8phAQ23yY3i5069eDaYu91jpDPIU8rQt0",
      audience: "https://dev-34chvqyi4i2beker.jp.auth0.com/api/v2/",
      grant_type: "client_credentials",
    };
    Axios(
      "https://dev-34chvqyi4i2beker.jp.auth0.com/oauth/token",
      "POST",
      body,
      null
    )
      .then((userToken) => {
        localStorage.setItem("user_token", userToken.access_token);
        getAllDataBaseConnection();
      })
      .catch((error) => {
        console.error("error ::", error);
      });
  };
  const getAllDataBaseConnection = () => {
    Axios(
      "https://dev-34chvqyi4i2beker.jp.auth0.com/api/v2/connections",
      "GET",
      null,
      localStorage.getItem("user_token")
    )
      .then((dataBase) => {
        console.log("database", dataBase);
        setlistOfConnnection(dataBase);
      })
      .catch((error) => {
        console.error("error ::", error);
      });
  };
  const addUser = () => {
    console.log("2callled");
    let body = {
      email: userEmail,
      name: userName,
      connection: databaseConnection,
      password: userPassword,
    };
    Axios(
      "https://dev-34chvqyi4i2beker.jp.auth0.com/api/v2/users",
      "POST",
      JSON.stringify(body),
      localStorage.getItem("user_token"),
      true
    )
      .then((addedUser) => {
        console.log(addedUser, "addedUser");
        setIsUserAdded(true);
        initializeFileds();
      })
      .catch((error) => {
        console.error("error ::", error.message);
      });
  };
  const getUserData = () => {
    setValidation(true);
    userPassword !== repeatPassword
      ? setPasswordValidation(true)
      : setPasswordValidation(false);
    let emailValidation = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
      userEmail
    );

    !emailValidation ? setEmailValidation(true) : setEmailValidation(false);

    if (
      userEmail.length !== 0 &&
      userPassword.length !== 0 &&
      databaseConnection.length !== 0
    ) {
      addUser();
    }
  };
  const toggleButton = () => {
    setIsUserAdded(false);
  };
  useEffect(() => {
    getUserToken();
  }, []);
  return (
    <div>
      <button
        type="button"
        class="btn btn-primary"
        data-bs-toggle="modal"
        data-bs-target="#exampleModal"
        data-bs-whatever="@mdo"
        onClick={initializeFileds}
      >
        + Create user
      </button>
      <div
        class="modal fade"
        id="exampleModal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                Create user
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={toggleButton}
              ></button>
            </div>
            <div class="modal-body">
              <form class="row g-2 needs-validation">
                <div class="mb-3 text-start">
                  <label for="recipient-name" class="col-form-label">
                    Name<span className="text-danger ps-1">*</span>
                  </label>
                  <input
                    type="email"
                    class="form-control"
                    id="userEmail"
                    value={userName}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  {validation && !userName && (
                    <p className="text-danger mt-1 mb-0">Name is required *</p>
                  )}
                </div>
                <div class="mb-3 text-start">
                  <label for="recipient-name" class="col-form-label">
                    Email<span className="text-danger ps-1">*</span>
                  </label>
                  <input
                    type="email"
                    class="form-control"
                    id="userEmail"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                  {validation && !userEmail && (
                    <p className="text-danger mt-1 mb-0">Email is required *</p>
                  )}
                  {emailValidation && (
                    <p className="text-danger mt-1 mb-0">
                      Enter valid e-mail *
                    </p>
                  )}
                </div>
                <div class="mb-3 text-start">
                  <label for="recipient-name" class="col-form-label">
                    Password<span className="text-danger ps-1">*</span>
                  </label>
                  <input
                    type="password"
                    class="form-control"
                    id="userPassword"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                  />
                  {validation && !userPassword && (
                    <p className="text-danger mt-1 mb-0">
                      Password is required
                    </p>
                  )}
                </div>
                <div class="mb-3 text-start">
                  <label for="recipient-name" class="col-form-label">
                    Repeat Password<span className="text-danger ps-1">*</span>
                  </label>
                  <input
                    type="password"
                    class="form-control"
                    id="repeatePassword"
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                  />
                  {validation && !repeatPassword && (
                    <p className="text-danger mt-1 mb-0">
                      Repeated Password is required
                    </p>
                  )}
                  {passwordValidation && (
                    <p className="text-danger">
                      Password should be same as password
                    </p>
                  )}
                </div>
                <div>
                  <label for="conection" className="pe-4 d-block text-start">
                    Connection <span className="text-danger ms-2">*</span>
                  </label>
                  <select
                    className="w-100 form-control"
                    onChange={(e) => setDatabaseConnection(e.target.value)}
                  >
                    <option value={databaseConnection}> None </option>
                    {listOfConnnection &&
                      listOfConnnection?.map((dataBase, index) => {
                        return (
                          <option value={dataBase.name} key={index}>
                            {dataBase.name}
                          </option>
                        );
                      })}
                    {!databaseConnection && (
                      <option value={"No data base found"}>
                        No data base found
                      </option>
                    )}
                  </select>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={toggleButton}
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                onClick={getUserData}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddUser;
