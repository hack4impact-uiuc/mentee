import React from "react";
import {
  UserOutlined,
  VideoCameraOutlined,
  CalendarOutlined,
  MailOutlined,
} from "@ant-design/icons";
import Sidebar from "./Sidebar";
import { useTranslation } from "react-i18next";
import { useAuth } from "utils/hooks/useAuth";

function MentorSidebar(props) {
  const { t } = useTranslation();
  const { role } = useAuth();
  const pages = {
    appointments: {
      name: t("sidebars.appointments"),
      path: "/appointments",
      icon: <CalendarOutlined />,
    },
    videos: {
      name: t("sidebars.videos"),
      path: "/videos",
      icon: <VideoCameraOutlined />,
    },
    profile: {
      name: t("sidebars.profile"),
      path: "/profile",
      icon: <UserOutlined />,
    },
    message: {
      name: t("common.messages"),
      path: "/messages/" + role,
      icon: <MailOutlined />,
    },
  };

  return <Sidebar pages={pages} selectedPage={props.selectedPage} />;
}

export default MentorSidebar;
