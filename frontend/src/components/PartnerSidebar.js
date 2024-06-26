import React from "react";
import {
  UserOutlined,
  CalendarOutlined,
  MailOutlined,
} from "@ant-design/icons";
import Sidebar from "./Sidebar";
import { useTranslation } from "react-i18next";
import { useAuth } from "utils/hooks/useAuth";
import CreateMeetingLink from "./components/CreateMeetingLink";

function PartnerSidebar(props) {
  const { t } = useTranslation();
  const { role } = useAuth();
  const pages = {
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

  //return <Sidebar pages={pages} selectedPage={props.selectedPage} />;
  return (
    <Sidebar pages={pages} selectedPage={props.selectedPage}>
      <Sidebar.Item key="createmeetinglink">
        <CreateMeetingLink />
      </Sidebar.Item>
      {/* Other sidebar content within Sidebar.Item components */}
    </Sidebar>
  );
}

export default PartnerSidebar;
