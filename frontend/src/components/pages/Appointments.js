import React from "react";
import { NavLink } from "react-router-dom";
import { Layout, Menu } from "antd";
import {
  UserOutlined,
  VideoCameraOutlined,
  CalendarOutlined,
  HomeOutlined,
  BellOutlined,
} from "@ant-design/icons";

import "antd/dist/antd.css";
import "../css/Appointments.scss";

import mentee_logo from "../../resources/mentee.png";

const { Header, Sider, Content } = Layout;

function Appointments() {
  return (
    <div>
      <Layout>
        <Header className="appointments-header">
          <img src={mentee_logo} alt="Mentee" className="mentee-logo" />
          <div style={{ float: "right" }}>two</div>
          <div className="notification-bell">
            <NavLink to="/">
              <BellOutlined />
            </NavLink>
          </div>
        </Header>
        <Layout>
          <Sider theme="light">
            <Menu theme="light" mode="inline" style={{ marginTop: "25%" }}>
              <Menu.Item
                key="home"
                className="appointments-menu-item"
                icon={<HomeOutlined />}
              >
                <NavLink to="/" style={{ color: "black" }}>
                  Home
                </NavLink>
              </Menu.Item>
              <Menu.Item
                key="appointments"
                className="appointments-menu-item-selected"
                icon={<CalendarOutlined />}
              >
                Appointments
              </Menu.Item>
              <Menu.Item
                key="videos"
                className="appointments-menu-item"
                icon={<VideoCameraOutlined />}
              >
                <NavLink to="/videos" style={{ color: "black" }}>
                  Your Videos
                </NavLink>
              </Menu.Item>
              <Menu.Item
                key="profile"
                className="appointments-menu-item"
                icon={<UserOutlined />}
              >
                <NavLink to="/profile" style={{ color: "black" }}>
                  Profile
                </NavLink>
              </Menu.Item>
            </Menu>
          </Sider>
          <Content className="appointments-content">
            Appointment page component goes here
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}

export default Appointments;
