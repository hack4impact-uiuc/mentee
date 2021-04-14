import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { Input, Button } from "antd";
import {
  isLoggedIn,
  getRegistrationStage,
  sendVerificationEmail,
  getUserEmail,
  isUserVerified,
  isUserMentor,
  isUserAdmin,
  refreshToken,
} from "utils/auth.service";
import MenteeButton from "../MenteeButton";
import { REGISTRATION_STAGE } from "utils/consts";

import "../css/Home.scss";
import "../css/Login.scss";
import "../css/Register.scss";
import Honeycomb from "../../resources/honeycomb.png";

function Verify({ history, sent }) {
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(false);
  const [resent, setResent] = useState(false);

  return (
    <div className="home-background">
      <div className="login-content">
        <div className="verify-container">
          <div className="verify-header-container">
            <div className="verify-header-text">
              <h1 className="login-text">Account Verification</h1>
              {error && (
                <div className="register-error">Error, please try again!</div>
              )}
              {resent && <div> Email resent! </div>}
              <br />
              <t className="verify-header-text-description">
                A verification email has been sent to your email. Please click
                the link contained inside to verify your account.
              </t>
            </div>
            <div className="verify-header-image">
              <img className="verify-honeycomb" src={Honeycomb} alt="" />
            </div>
          </div>
          <div className="login-button">
            <MenteeButton
              content={<b>Confirm</b>}
              width={"50%"}
              height={"125%"}
              loading={verifying}
              onClick={async () => {
                setVerifying(true);
                const success = await isUserVerified();
                if (success) {
                  if (await isUserMentor()) {
                    history.push("/create-profile");
                  } else if (await isUserAdmin()) {
                    await refreshToken();
                    history.push("/account-data");
                  }
                } else {
                  setError(true);
                  setResent(false);
                  setVerifying(false);
                }
              }}
            />
          </div>
          <div className="login-register-container">
            Didn&#39;t receive an email?
            <Button
              type="link"
              className="verify-resend-link"
              onClick={async () => {
                // TODO: error handling for resend?
                const res = await sendVerificationEmail(await getUserEmail());
                setResent(true);
              }}
            >
              <u>Resend</u>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withRouter(Verify);
