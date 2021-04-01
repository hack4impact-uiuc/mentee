import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Layout } from "antd";
import { isLoggedIn } from "utils/auth.service";
import useAuth from "utils/useAuth";

import UserNavHeader from "./UserNavHeader";
import GuestNavHeader from "./GuestNavHeader";
import AdminNavHeader from "./AdminNavHeader";
import NavigationSidebar from "./NavigationSidebar";
import AdminSidebar from "./AdminSidebar";

import "./css/Navigation.scss";

const { Content } = Layout;

function Navigation(props) {
  const history = useHistory();
  const { isAdmin, isMentor, isMentee } = useAuth();

  useEffect(() => {
    if (props.needsAuth && !isLoggedIn()) {
      history.push("/login");
    }
  }, [history, props.needsAuth]);

  return (
    <div>
      <Layout className="navigation-layout">
        {props.needsAuth ? (
          isAdmin ? (
            <AdminNavHeader />
          ) : (
            <UserNavHeader />
          )
        ) : (
          <GuestNavHeader />
        )}
        {props.needsAuth ? (
          <Layout>
            {isAdmin ? (
              <AdminSidebar />
            ) : (
              <NavigationSidebar selectedPage={props.page} />
            )}
            <Content className="navigation-content">{props.content}</Content>
          </Layout>
        ) : (
          <Content className="navigation-content">{props.content}</Content>
        )}
      </Layout>
    </div>
  );
}

export default Navigation;
