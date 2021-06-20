import { Modal, Input } from "antd";
import React, { useState, useEffect } from "react";
import MenteeButton from "./MenteeButton";
import { verify } from "../utils/verifyMentee";
import { isLoggedIn } from "utils/auth.service";
import useAuth from "../utils/hooks/useAuth";

import "./css/VerificationModal.scss";
import { CheckCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons";
import { useHistory } from "react-router-dom";

/**
 * NOTE:
 * Every modal that is open is its own instance
 * so all the props and email/password
 * are not connected between modals
 */
function LoginVerificationModal(props) {
  const history = useHistory();
  const [isVisible, setIsVisible] = useState(false);
  const { onAuthStateChanged } = useAuth();

  /**
   * This is the entry point for whether one
   * is allowed to view a page or modal.
   */
  const handleViewPermission = () => {
    if (isLoggedIn()) {
      setIsVisible(false);
      props.onVerified();
      return;
    }

    setIsVisible(true);
  };

  return (
    <span className={props.className}>
      <MenteeButton
        theme={props.theme}
        content={props.content}
        onClick={handleViewPermission}
        width={props.width}
        height={props.height}
        style={props.style}
        loading={props.loading}
      />
      <Modal
        title="Access Denied"
        visible={isVisible}
        className="verification-modal"
        onCancel={() => {
          setIsVisible(false);
        }}
        footer={
          <div className="footer-container">
            <MenteeButton
              content="Login"
              onClick={() => {
                setIsVisible(false);
                history.push({pathname: "/select-login"});
              }}
            />
          </div>
        }
      >
        <div className="verification-body">
          <div className="verification-header">You must login to continue.</div>
        </div>
      </Modal>
    </span>
  );
}

export default LoginVerificationModal;
