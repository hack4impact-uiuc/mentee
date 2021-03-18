import React, { useCallback, useState, useEffect } from "react";
import { NavLink, useHistory } from "react-router-dom";
import { Input } from "antd";
import { isLoggedIn, login, refreshToken } from "utils/auth.service";
import MenteeButton from "../MenteeButton";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import "../css/Home.scss";
import "../css/Login.scss";
import Logo from "../../resources/logo.png";
import firebase from "firebase";

const INCORRECT_NAME_PASSWORD_ERROR_MSG =
  "Incorrect username and/or password. Please try again.";
const RESET_PASSWORD_ERROR_MSG = "Please reset password. An link to reset your password has been sent to your email.";
const SERVER_ERROR_MSG = "Something went wrong.";

function Login() {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [inputFocus, setInputFocus] = useState([false, false]);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    INCORRECT_NAME_PASSWORD_ERROR_MSG
  );
  const [loggingIn, setLoggingIn] = useState(false);
  const history = useHistory();

  function handleInputFocus(index) {
    let newClickedInput = [false, false];
    newClickedInput[index] = true;
    setInputFocus(newClickedInput);
  }

  const redirectToAppointments = useCallback(() => {
    history.push("appointments");
  }, [history]);

  useEffect(() => {
    if (isLoggedIn()) {
      redirectToAppointments();
    }
  }, [redirectToAppointments]);

  return (
    <div className="home-background">
      <div className="login-content">
        <div className="login-container">
          <h1 className="login-text">Sign In</h1>
          {error && <div className="login-error">{errorMessage}</div>}
          <div
            className={`login-input-container${
              inputFocus[0] ? "__clicked" : ""
            }`}
          >
            <Input
              className="login-input"
              onFocus={() => handleInputFocus(0)}
              disabled={loggingIn}
              onChange={(e) => setEmail(e.target.value)}
              bordered={false}
              placeholder="Email"
            />
          </div>
          <div
            className={`login-input-container${
              inputFocus[1] ? "__clicked" : ""
            }`}
          >
            <Input.Password
              className="login-input"
              disabled={loggingIn}
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              onFocus={() => handleInputFocus(1)}
              onChange={(e) => setPassword(e.target.value)}
              bordered={false}
              placeholder="Password"
            />
          </div>
          <div className="login-button">
            <MenteeButton
              content={<b>Log In</b>}
              width={"50%"}
              height={"125%"}
              loading={loggingIn}
              onClick={async () => {
                setLoggingIn(true);
                const res = await login(email, password);

                if (!res) {
                  setErrorMessage(SERVER_ERROR_MSG);
                  setError(true);
                } else if (!res.success) {
                  setErrorMessage(INCORRECT_NAME_PASSWORD_ERROR_MSG);
                  setError(true);
                } else if (res.result.passwordReset) {
                  setErrorMessage(RESET_PASSWORD_ERROR_MSG);
                  setError(true);
                }

                firebase.auth().onAuthStateChanged((user) => {
                  if (!user) return;
                  redirectToAppointments();
                });

                setLoggingIn(false);
              }}
            />
          </div>
          <div className="login-register-container">
            <div>Don&#39;t have an account?</div>
            <NavLink to="/register" className="login-register-link">
              Register
            </NavLink>
          </div>
        </div>
        <img className="logo" src={Logo} alt="" />
      </div>
    </div>
  );
}

export default Login;
