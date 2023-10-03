import React, { useEffect, useState } from "react";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Typography } from "antd";
import { withRouter } from "react-router-dom";
import { useAuth } from "../../utils/hooks/useAuth";
import {
  fetchEventById,
  fetchMentors,
  fetchMentees,
  fetchPartners,
  fetchAccounts,
} from "utils/api";
import { useTranslation } from "react-i18next";
import { formatDateTime } from "utils/consts";

const { Title, Paragraph } = Typography;

function EventDetail({ match }) {
  const id = match.params.id;
  const [event, setEvent] = useState({});
  const [createUser, setCreateUser] = useState({});
  const { isAdmin, role } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    async function getEvent() {
      var all_users = [];
      if (!isAdmin) {
        all_users = await fetchAccounts(role);
      } else {
        const mentor_data = await fetchMentors();
        const mentee_data = await fetchMentees();
        const partenr_data = await fetchPartners();
        all_users = [...mentee_data, ...mentor_data, ...partenr_data];
      }

      const EventData = await fetchEventById(id);
      if (EventData) {
        setEvent(EventData);
      }

      setTimeout(() => {
        const create_user = all_users.find(
          (x) => x._id.$oid === EventData.user_id.$oid
        );
        setCreateUser(create_user);
      }, 500);
    }
    getEvent();
  }, [id]);

  return (
    <div className="mentor-profile-flexbox">
      <div className={"mentor-profile-content-public"}>
        <div style={{ minWidth: "65%" }}>
          <div style={{ display: "flex" }}>
            <Avatar
              size={120}
              src={createUser && createUser.image && createUser.image.url}
              icon={<UserOutlined />}
            />
            <div style={{ marginLeft: "20px" }}>
              <Title className="gallery-title-text">
                {event && event.title}
              </Title>
              <div className="gallery-header-description">
                {t("events.eventsubmitby")} :{" "}
                <span>
                  {createUser && createUser.name
                    ? createUser.name
                    : "Admin User"}
                </span>
              </div>
            </div>
          </div>

          <div className="datetime-area" style={{ marginTop: "20px" }}>
            {event.start_datetime && (
              <>
                <span style={{ fontSize: "20px", color: "#800020" }}>
                  {formatDateTime(new Date(event.start_datetime.$date))} ~{" "}
                </span>
                {event.end_datetime && (
                  <span style={{ fontSize: "20px", color: "#800020" }}>
                    {formatDateTime(new Date(event.end_datetime.$date))}
                  </span>
                )}
              </>
            )}

            {event.image_file && (
              <Typography>
                <img
                  style={{ marginLeft: "5%", marginTop: "15px", width: "60%" }}
                  className="event-img"
                  src={event.image_file.url}
                  alt=""
                />
              </Typography>
            )}
            {event.description && (
              <Typography>
                <Paragraph
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    marginTop: "5px",
                    marginBottom: "5px",
                  }}
                >
                  {t("events.summary")}:
                </Paragraph>
                <Paragraph
                  style={{
                    fontSize: "16px",
                    paddingLeft: "10px",
                    marginTop: "5px",
                    marginBottom: "5px",
                  }}
                >
                  {event.description}
                </Paragraph>
              </Typography>
            )}
            <div style={{ marginTop: "15px" }}>
              {event.url && <a href={event.url}>{event.url}</a>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withRouter(EventDetail);
