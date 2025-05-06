import React, { useEffect, useState } from "react";
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
  Modal,
  Radio,
  Row,
  Col,
  Typography,
  Tag,
} from "antd";
import {
  UserOutlined,
  SearchOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

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

  const { Title } = Typography;

  const [option, setOption] = useState(options.MENTEES);
  const [selectActived, setSelectActived] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [modalMessageFilter, setModalMessageFilter] = useState("all");
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedReceiver, setSelectedReceiver] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [searchWord, setSearchWord] = useState(null);

  const getFilteredModalMessages = () => {
    if (!modalData || !Array.isArray(modalData)) return [];

    // if (modalMessageFilter === "all") {
    //   return modalData;
    // }

    return modalData.filter((message) => {
      const matchSearchWord =
        !searchWord ||
        message.body.toUpperCase().includes(searchWord.toUpperCase());
      let matchGroup = true;
      if (modalMessageFilter !== "all") {
        const messageSenderId = message.sender_id?.$oid || message.sender_id;
        if (modalMessageFilter === "from_mentors") {
          if (option.text === "Mentors") {
            matchGroup = messageSenderId === selectedRow.id.$oid;
          } else {
            matchGroup = messageSenderId === selectedReceiver.id.$oid;
          }
        } else {
          if (option.text === "Mentors") {
            matchGroup = messageSenderId === selectedReceiver.id.$oid;
          } else {
            matchGroup = messageSenderId === selectedRow.id.$oid;
          }
        }
      }
      return matchSearchWord && matchGroup;
    });
  };

  const showDetailModal = (receiver_data, record) => {
    setShowModal(true);
    setSelectedRow(record);
    setSelectedReceiver(receiver_data);
    setSortOrder("newest"); // Reset sort order to newest when opening modal
    setModalMessageFilter("all"); // Reset message filter to show all messages
    const sortedMessages = Array.isArray(receiver_data.message_data)
      ? [...receiver_data.message_data].sort((a, b) => {
          const dateA = a?.created_at?.$date
            ? new Date(a.created_at.$date)
            : new Date(0);
          const dateB = b?.created_at?.$date
            ? new Date(b.created_at.$date)
            : new Date(0);
          return dateB - dateA; // Descending order (newest first)
        })
      : [];

    setModalData(sortedMessages || []);
  };

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
      render: (message_receive_data, record) => {
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
                      <div
                        onClick={() => showDetailModal(item, record)}
                        style={{
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
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

  const handleSearchMessages = (search_word) => {
    setSearchWord(search_word);
  };

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

      <Modal
        title="Message Details"
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          setModalData([]);
          setSelectedRow(null);
          setSelectedReceiver(null);
          setSearchWord(null);
        }}
        footer={null}
        width={"90%"}
        className="message-details-modal modal-container"
        centered
      >
        <div className="modal-content">
          <div className="message-details-header">
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12}>
                <div className="message-profile">
                  <Avatar
                    size={50}
                    icon={<UserOutlined />}
                    className="modal-profile-icon2"
                    src={
                      selectedRow && selectedRow.image
                        ? selectedRow.image.url
                        : ""
                    }
                  />
                  <div className="message-profile-info">
                    <p className="message-profile-name">{selectedRow?.name}</p>
                    <p className="message-profile-role">
                      {option.text === "Mentors" ? "Mentor" : "Mentee"}
                    </p>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div className="message-profile">
                  <Avatar
                    size={50}
                    icon={<UserOutlined />}
                    className="modal-profile-icon2"
                    src={selectedReceiver ? selectedReceiver.image?.url : ""}
                  />
                  <div className="message-profile-info">
                    <p className="message-profile-name">
                      {selectedReceiver ? selectedReceiver.receiver_name : ""}
                    </p>
                    <p className="message-profile-role">
                      {option.text === "Mentors" ? "Mentee" : "Mentor"}
                    </p>
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          <Title level={4} className="modal-title">
            Conversation
          </Title>

          <div className="message-navigation">
            <div className="message-navigation-controls">
              <Radio.Group
                value={sortOrder}
                buttonStyle="solid"
                onChange={(e) => {
                  const newSortOrder = e.target.value;
                  setSortOrder(newSortOrder);

                  setModalData((prevData) => {
                    if (!Array.isArray(prevData)) return [];

                    return [...prevData].sort((a, b) => {
                      const dateA = a?.created_at?.$date
                        ? new Date(a.created_at.$date)
                        : new Date(0);
                      const dateB = b?.created_at?.$date
                        ? new Date(b.created_at.$date)
                        : new Date(0);
                      return newSortOrder === "newest"
                        ? dateB - dateA
                        : dateA - dateB;
                    });
                  });
                }}
              >
                <Radio.Button value="newest">Newest First</Radio.Button>
                <Radio.Button value="oldest">Oldest First</Radio.Button>
              </Radio.Group>

              <Radio.Group
                value={modalMessageFilter}
                buttonStyle="solid"
                onChange={(e) => setModalMessageFilter(e.target.value)}
              >
                <Radio.Button value="all">All Messages</Radio.Button>
                <Radio.Button value="from_mentors">From Mentor</Radio.Button>
                <Radio.Button value="from_mentees">From Mentee</Radio.Button>
              </Radio.Group>
            </div>

            <Input.Search
              placeholder="Search in conversation"
              className="conversation-search"
              allowClear
              value={searchWord}
              onChange={(e) => handleSearchMessages(e.target.value)}
            />
          </div>

          <div className="message-count">
            <Typography.Text type="secondary">
              Showing {getFilteredModalMessages().length} message
              {getFilteredModalMessages().length !== 1 ? "s" : ""}
            </Typography.Text>
          </div>

          <div className="message-bubble-container">
            {Array.isArray(getFilteredModalMessages()) &&
            getFilteredModalMessages().length > 0 ? (
              getFilteredModalMessages().map((message, index) => {
                const selected_user_id = selectedRow?.id.$oid;
                const senderId = message.sender_id?.$oid || message.sender_id;
                const isSender = senderId === selected_user_id;

                const date = new Date(message.created_at.$date);

                const showUnansweredTag =
                  selectedRow?.hasUnansweredMessages && isSender && index === 0;
                return (
                  <div
                    key={index}
                    className={`message-bubble ${
                      isSender
                        ? "message-bubble-mentee"
                        : "message-bubble-mentor"
                    }`}
                  >
                    <div style={{ display: "flex" }}>
                      <Avatar
                        style={{ marginRight: "8px" }}
                        size={25}
                        icon={<UserOutlined />}
                        className=""
                        src={
                          isSender
                            ? selectedRow && selectedRow.image
                              ? selectedRow.image.url
                              : ""
                            : selectedReceiver && selectedReceiver.image
                            ? selectedReceiver.image.url
                            : ""
                        }
                      />
                      <div className="message-bubble-content">
                        {message.body}
                      </div>
                    </div>

                    <div className="message-bubble-footer">
                      <span className="message-date">
                        {date.toLocaleString()}
                      </span>
                      <div>
                        {/* <Tag color={isSender ? "green" : "blue"}>
                          {isSender ? "Mentee" : "Mentor"}
                        </Tag> */}
                        {showUnansweredTag && (
                          <Tag
                            color="orange"
                            icon={<ExclamationCircleOutlined />}
                          >
                            Unanswered
                          </Tag>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-messages">No messages to display</div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
