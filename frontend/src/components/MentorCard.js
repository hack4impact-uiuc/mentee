import React from "react";
import { NavLink } from "react-router-dom";
import { Avatar, Button, Typography } from "antd";
import {
  LinkOutlined,
  LinkedinOutlined,
  StarOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from "@ant-design/icons";

import "./css/Gallery.scss";

const { Title, Text } = Typography;

const styles = {
  title: {
    margin: 0,
  },
  icon: {
    fontSize: "20px",
    paddingRight: "7px",
  },
};

function MentorCard(props) {
  function getPicture(picture) {
    if (!picture) {
      return <UserOutlined />;
    } else {
      return <img src={picture} alt="" />;
    }
  }

  return (
    <div className="gallery-mentor-card">
      <div className="gallery-card-body">
        <div className="gallery-card-header">
          <Avatar size={90} icon={getPicture(props.picture)} />
          <div className="gallery-header-text">
            <Title style={styles.title} className="gallery-title-text">
              {props.name}
            </Title>
            <Title style={styles.title} type="secondary" level={5}>
              {props.professional_title}
            </Title>
            <Title style={styles.title} type="secondary" level={5}>
              Speaks: {props.languages.join(", ")}
            </Title>
          </div>
        </div>
        <h3 className="gallery-lesson-types">
          <span className="gallery-dot" />
          {props.lesson_types}
        </h3>
        <h3 className="gallery-headers">
          <EnvironmentOutlined style={styles.icon} />
          Location:
        </h3>
        <Text className="gallery-list-items">{props.location}</Text>
        <h3 className="gallery-headers">
          <StarOutlined style={styles.icon} />
          Specializations:
        </h3>
        <Text className="gallery-list-items">
          {props.specializations.join(", ")}
        </Text>
        <h4>
          <LinkOutlined style={styles.icon} />
          <a className="gallery-links" href={props.website}>
            {props.website}
          </a>
        </h4>
        <h4>
          <LinkedinOutlined style={styles.icon} />
          <a className="gallery-links" href={props.linkedin}>
            linkedin
          </a>
        </h4>
        <hr className="gallery-solid-border" />
        <NavLink to={"/gallery/" + props.id}>
          <Button className="gallery-profile-button">View Profile</Button>
        </NavLink>
      </div>
    </div>
  );
}

export default MentorCard;
