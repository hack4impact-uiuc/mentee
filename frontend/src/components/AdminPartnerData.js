import React, { useEffect, useState, useCallback, useRef } from "react";
import { fetchAccounts, fetchAccountById } from "utils/api";
import Meta from "antd/lib/card/Meta";
import {
  Table,
  Input,
  Dropdown,
  Menu,
  message,
  Avatar,
  Layout,
  Spin,
  Divider,
  Card,
  theme,
  Switch,
} from "antd";
import { UserOutlined, SearchOutlined, DownOutlined } from "@ant-design/icons";

import "./css/Training.scss";
import { ACCOUNT_TYPE } from "utils/consts";
import { css } from "@emotion/css";

export const AdminPartnerData = () => {
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filterData, setfilterData] = useState([]);

  const [messageApi, contextHolder] = message.useMessage();
  const { Sider } = Layout;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const {
    token: {
      colorPrimaryBg,
      colorPrimaryBorder,
      colorBorderSecondary,
      colorPrimary,
    },
  } = theme.useToken();

  const activeCardStyle = css`
    background: ${colorPrimaryBg};
    border: 1px solid ${colorPrimaryBorder};

    :hover {
      background: ${colorPrimaryBg};
    }
  `;

  const options = {
    MENTORS: {
      key: ACCOUNT_TYPE.MENTOR,
      text: "Mentors",
    },
    MENTEES: {
      key: ACCOUNT_TYPE.MENTEE,
      text: "Mentees",
    },
  };

  const [option, setOption] = useState(options.MENTEES);
  const [selectActived, setSelectActived] = useState(false);
  const [tableData, setTableData] = useState([]);

  const overlay = (
    <Menu>
      <Menu.Item>
        <a onClick={() => setOption(options.MENTORS)}>Mentors</a>
      </Menu.Item>
      <Menu.Item>
        <a onClick={() => setOption(options.MENTEES)}>Mentees</a>
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: "Logo",
      dataIndex: "image",
      key: "image",
      render: (image) => {
        return (
          <div className="flex flex-center">
            <Avatar
              size={30}
              icon={<UserOutlined />}
              className="modal-profile-icon2"
              src={image ? image.url : ""}
            />
          </div>
        );
      },
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "organization",
      render: (organization) => <span>{organization}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => <span>{email}</span>,
    },
    {
      title:
        option.key === ACCOUNT_TYPE.MENTEE
          ? "Receiver(Count of Messages)"
          : "Sender(Count of Messages)",
      dataIndex: "message_receive_data",
      key: "message_receive_data",
      render: (message_receive_data) => {
        return (
          <>
            {message_receive_data &&
              message_receive_data.length > 0 &&
              message_receive_data.map((item) => {
                if (item.numberOfMessages > 0) {
                  return (
                    <div style={{ display: "flex", lineHeight: "40px" }}>
                      <Avatar
                        size={18}
                        icon={<UserOutlined />}
                        className="modal-profile-icon2"
                        src={item.image ? item.image.url : ""}
                      />
                      <div>
                        {item.receiver_name}&nbsp;&nbsp;({item.numberOfMessages}
                        )
                      </div>
                    </div>
                  );
                } else {
                  return <></>;
                }
              })}
          </>
        );
      },
    },
  ];
  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      let dataa = await fetchAccounts(ACCOUNT_TYPE.PARTNER);
      if (dataa) {
        setData(dataa);
        setfilterData(dataa);
      }
      setLoading(false);
    };
    getData();
  }, []);

  useEffect(() => {
    if (selectedPartner) {
      if (option.key === ACCOUNT_TYPE.MENTEE) {
        if (selectedPartner.assign_mentees) {
          if (selectActived) {
            let temp = [];
            selectedPartner.assign_mentees.map((item) => {
              if (
                item.message_receive_data &&
                item.message_receive_data.length > 0
              ) {
                if (
                  item.message_receive_data.filter(
                    (x) => x.numberOfMessages > 0
                  ).length > 0
                ) {
                  temp.push(item);
                }
              }
            });
            setTableData(temp);
          } else {
            setTableData(selectedPartner.assign_mentees);
          }
        }
      } else {
        if (selectedPartner.assign_mentors) {
          if (selectActived) {
            let temp = [];
            selectedPartner.assign_mentors.map((item) => {
              if (
                item.message_receive_data &&
                item.message_receive_data.length > 0
              ) {
                if (
                  item.message_receive_data.filter(
                    (x) => x.numberOfMessages > 0
                  ).length > 0
                ) {
                  temp.push(item);
                }
              }
            });
            setTableData(temp);
          } else {
            setTableData(selectedPartner.assign_mentors);
          }
        }
      }
    }
  }, [option, selectActived]);

  const selectParnter = async (partner) => {
    setSubLoading(true);
    let partner_data = await fetchAccountById(
      partner._id.$oid,
      ACCOUNT_TYPE.PARTNER
    );
    if (partner_data) {
      setSelectedPartner(partner_data);
      if (option.key === ACCOUNT_TYPE.MENTEE) {
        if (partner_data.assign_mentees) {
          if (selectActived) {
            let temp = [];
            partner_data.assign_mentees.map((item) => {
              if (
                item.message_receive_data &&
                item.message_receive_data.length > 0
              ) {
                if (
                  item.message_receive_data.filter(
                    (x) => x.numberOfMessages > 0
                  ).length > 0
                ) {
                  temp.push(item);
                }
              }
            });
            setTableData(temp);
          } else {
            setTableData(partner_data.assign_mentees);
          }
        }
      } else {
        if (partner_data.assign_mentors) {
          if (selectActived) {
            let temp = [];
            partner_data.assign_mentors.map((item) => {
              if (
                item.message_receive_data &&
                item.message_receive_data.length > 0
              ) {
                if (
                  item.message_receive_data.filter(
                    (x) => x.numberOfMessages > 0
                  ).length > 0
                ) {
                  temp.push(item);
                }
              }
            });
            setTableData(temp);
          } else {
            setTableData(partner_data.assign_mentors);
          }
        }
      }
    }
    setSubLoading(false);
  };

  return (
    <div className="">
      {contextHolder}
      <div className="trainTable" style={{ display: "flex" }}>
        <Sider
          style={{ background: "white" }}
          width={400}
          className="messages-sidebar-background"
        >
          <Spin
            wrapperClassName={css`
              width: 100%;
            `}
            spinning={loading}
          >
            <div className="messages-sidebar-header">
              <h1>{"Partners"}</h1>
            </div>
            <div
              className={css`
                padding: 0 20px;
                margin-bottom: 10px;
              `}
            >
              <Input
                placeholder={"search"}
                prefix={<SearchOutlined />}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value) {
                    setfilterData(data);
                  } else {
                    setfilterData(
                      data.filter(
                        (x) =>
                          x.organization &&
                          x.organization
                            .toUpperCase()
                            .includes(e.target.value.toUpperCase())
                      )
                    );
                  }
                }}
              />
            </div>
            <Divider className="header-divider" orientation="left"></Divider>
            <div className="messages-sidebar" style={{ paddingTop: "1em" }}>
              {filterData &&
                filterData.length > 0 &&
                filterData.map((partner) => {
                  return (
                    <Card
                      onClick={() => {
                        selectParnter(partner);
                      }}
                      className={css`
                        width: 100%;
                        margin-bottom: 3%;
                        border: 1px solid "#e8e8e8";
                        box-sizing: border-box;
                        border-radius: 7px;

                        :hover {
                          background-color: ${colorBorderSecondary};
                          border-color: ${colorPrimaryBorder};
                          cursor: pointer;
                          transition: all 0.3s
                            cubic-bezier(0.645, 0.045, 0.355, 1);
                        }

                        ${selectedPartner &&
                        selectedPartner._id.$oid == partner._id.$oid &&
                        activeCardStyle}
                      `}
                    >
                      <div
                        className={
                          selectedPartner &&
                          selectedPartner._id.$oid == partner._id.$oid &&
                          css`
                            div {
                              color: ${colorPrimary} !important;
                            }
                          `
                        }
                      >
                        <Meta
                          avatar={
                            <Avatar
                              icon={<UserOutlined />}
                              src={partner.image ? partner.image.url : null}
                            />
                          }
                          title={
                            partner.name ? partner.name : partner.organization
                          }
                        />
                      </div>
                    </Card>
                  );
                })}
            </div>
          </Spin>
        </Sider>
        <div
          className="main-area"
          style={{
            paddingLeft: "2rem",
            width: "100%",
            paddingTop: "1rem",
            paddingRight: "2rem",
          }}
        >
          <div style={{ marginBottom: "1rem" }}>
            <Dropdown
              overlay={overlay}
              className={"table-button"}
              trigger={["click"]}
            >
              <a>
                {option.text} <DownOutlined />
              </a>
            </Dropdown>

            <Switch
              onChange={(e) => setSelectActived(e)}
              style={{ marginLeft: "2rem", marginRight: "0.5rem" }}
              checked={selectActived}
            />
            <span style={{ color: "#1677ff" }}>{"Active"}</span>
          </div>
          <div style={{ width: "100%" }}>
            <Spin
              wrapperClassName={css`
                width: 100%;
              `}
              spinning={subLoading}
            >
              <Table columns={columns} dataSource={tableData} />
            </Spin>
          </div>
        </div>
      </div>
    </div>
  );
};
