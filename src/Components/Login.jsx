import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import AlertModal from "../Utils/AlertModal";
import { Button } from "react-bootstrap";

const Login = () => {
  const { error, loginWithRedirect } = useAuth0();
  const [isError, setIsError] = useState(false);

  const login = async () => {
    await loginWithRedirect();
  };

  const clearQueryParameters = () => {
    const urlWithoutQueryParams = window.location.href.split("?")[0];
    window.history.replaceState({}, document.title, urlWithoutQueryParams);
  };

  useEffect(() => {
    if (error?.message) {
      console.error(error?.message);
      setIsError(true);
      clearQueryParameters();
    }
  }, [error]);

  return (
    <>
      <div className="ms-2 me-3">
        <Button
          variant="primary"
          // style={{ padding: "10px", width: "92px" }}
          // size="sm"
          onClick={() => login()}
        >
          Login
        </Button>{" "}
      </div>
      <div>
        {isError && (
          <AlertModal
            title={"Registration Received"}
            body={`Welcome, and thank you for registering on our site!
In response, we have sent an email to the address you specified.
Before you can use your login, and for your security, you need to accept our email.
Please retrieve our email and click on the verification link.`}
            buttonLabel={"Continue"}
          />
        )}
      </div>
    </>
  );
};

export default Login;
