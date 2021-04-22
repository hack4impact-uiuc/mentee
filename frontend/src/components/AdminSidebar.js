import React from "react";
import {
  DatabaseOutlined,
  UsergroupAddOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Sidebar from "./Sidebar";

const pages = {
  applications: {
    name: "Applications",
    path: "/organizer",
    icon: <UsergroupAddOutlined />,
    isSubMenu: false,
  },
  verifiedEmails: {
    name: "Verified Emails",
    path: "/verified-emails",
    icon: <SearchOutlined />,
    isSubMenu: false,
  },
  reports: {
    name: "Reports",
    isSubMenu: true,
    icon: <DatabaseOutlined />,
    items: {
      accountData: {
        name: "Account Data",
        path: "/account-data",
      },
      allAppointments: {
        name: "All Appointments",
        path: "/all-appointments",
      },
    },
  },
};

const subMenus = ["reports"];

function AdminSidebar(props) {
  return (
    <Sidebar
      pages={pages}
      selectedPage={props.selectedPage}
      subMenus={subMenus}
    />
  );
}

export default AdminSidebar;
