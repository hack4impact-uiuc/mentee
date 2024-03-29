import React from "react";
import MentorImage from "resources/mentor-login-logo.png";
import MenteeLogin from "resources/mentee-login-logo.png";
import AdminImage from "resources/admin-login-logo.png";
import loginimg from "resources/login.png";
import PartnerImage from "resources/partner.png";
import "components/css/SelectLogin.scss";
import { useTranslation } from "react-i18next";

function SelectLogin({
  displaySelect,
  handleSelect,
  handleDisplayImages,
  isAdmin,
  isGuest,
}) {
  const { t } = useTranslation();

  return (
    <div className="select-login-page">
      <div
        className="select-login-header"
        style={{ visibility: displaySelect ? "visible" : "hidden" }}
      >
        {t("login.clickLoginPrompt")}
      </div>

      {!isAdmin && !isGuest ? (
        <div
          className="select-login-container"
          style={{ visibility: displaySelect ? "visible" : "hidden" }}
        >
          <div
            className="select-login-elem"
            onClick={() => {
              handleSelect("mentee");
            }}
          >
            <img
              src={MenteeLogin}
              alt={t("common.mentee")}
              className="select-image mentee-image"
            />
            <div className="select-text">{t("common.mentee")}</div>
          </div>
          <div
            className="select-login-elem"
            onClick={() => {
              handleSelect("mentor");
            }}
          >
            <img
              src={MentorImage}
              alt={t("common.mentor")}
              className="mentor-image"
            />
            <div className="select-text">{t("common.mentor")}</div>
          </div>
          <div
            className="select-login-elem"
            onClick={() => {
              handleSelect("partner");
            }}
          >
            <img
              src={PartnerImage}
              alt={t("common.partner")}
              className="select-image partner-image"
              onLoad={handleDisplayImages}
            />
            <div className="select-text">{t("common.partner")}</div>
          </div>
        </div>
      ) : (
        <div
          className="select-login-container"
          style={{ visibility: displaySelect ? "visible" : "hidden" }}
        >
          <div
            className="select-login-elem"
            onClick={() => {
              isAdmin ? handleSelect("admin") : handleSelect("guest");
            }}
          >
            <img
              src={isAdmin ? AdminImage : loginimg}
              alt={t("common.admin")}
              className="select-image partner-image"
              onLoad={handleDisplayImages}
              style={{ left: "21.53%" }}
            />
            <div className="select-text"> {isAdmin ? "Admin" : "Login"}</div>
          </div>
        </div>
      )}

      {/**/}
    </div>
  );
}

export default SelectLogin;
