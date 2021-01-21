import React from "react";
import { Modal } from "antd";
import MenteeButton from "./MenteeButton";
import { EnvironmentOutlined, CommentOutlined } from "@ant-design/icons";

import "./css/Appointments.scss";

function AppointmentInfo(props) {
  const getLanguages = (languages) => {
    return languages.join(" • ");
  };

  const getCategories = (specialist_categories) => {
    return specialist_categories.join(", ");
  };

  const getSubtext = (gender, ethnicity, organization) => {
    var subtextInfo = [gender, ethnicity];
    if (organization != undefined) {
      subtextInfo.push(organization);
    }
    return subtextInfo.join(" • ");
  };

  const displayButtons = () => {
    if (props.needButtons) {
      return (
        <div style={{ textAlign: "center" }}>
          <MenteeButton
            content={"Accept"}
            border={"1px solid green"}
            onClick={() =>
              props.handleAppointmentClick(props.modalAppointment.id, true)
            }
          />
          <MenteeButton
            content={"Deny"}
            border={"1px solid red"}
            onClick={() =>
              props.handleAppointmentClick(props.modalAppointment.id, false)
            }
          />
        </div>
      );
    } else {
      return null;
    }
  };

  const pendingOrUpcoming = () => {
    if (props.needButtons) {
      return (
        <div className="ar-status">
          pending<span class="pending-dot"></span>
        </div>
      );
    } else {
      return (
        <div className="ar-status">
          upcoming<span class="upcoming-dot"></span>
        </div>
      );
    }
  };

  return (
    <Modal
      visible={props.modalVisible}
      title="Appointment Details"
      width="449.91px"
      onCancel={() => props.setModalVisible(false)}
      footer={displayButtons()}
    >
      <div className="ar-modal-container">
        {pendingOrUpcoming()}
        <div className="ar-modal-title">
          {props.modalAppointment.name}, {props.age}
        </div>
        <div className="personal-info">
          <div className="ar-title-subtext">
            {getSubtext(
              props.modalAppointment.gender,
              props.modalAppointment.ethnicity,
              props.modalAppointment.organization
            )}
          </div>
          <div className="ar-languages">
            <CommentOutlined className="ar-icon"></CommentOutlined>
            {getLanguages(props.modalAppointment.languages || [])}
          </div>
          <div className="ar-location">
            <EnvironmentOutlined className="ar-icon"></EnvironmentOutlined>
            {props.modalAppointment.location}
          </div>
        </div>
        <div className="ar-phone">
          Call/text: {props.modalAppointment.phone_number}
        </div>
        <div className="ar-email">{props.modalAppointment.email}</div>
        
        
        <div className="ar-apt-date">{props.modalAppointment.date}</div>
        <div className="ar-apt-time">{props.modalAppointment.time}</div>
        <div className="vl"></div>
        <div className="ar-categories-title">Seeking help in:</div>
        <div className="ar-categories">
          {getCategories(props.modalAppointment.specialist_categories || [])}
        </div>
        <div className="ar-goals-title">Note:</div>
        <div className="ar-goals">{props.modalAppointment.description}</div>
      </div>
    </Modal>
  );
}

export default AppointmentInfo;
