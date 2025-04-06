import React, { useEffect, useState, useRef, useCallback } from "react";
import { Avatar, Input, Button, Spin, Modal, theme, Drawer, DatePicker, Space, Tooltip, Alert } from "antd";
import { withRouter, NavLink } from "react-router-dom";
import { ACCOUNT_TYPE } from "utils/consts";
import moment from "moment-timezone";
import { SendOutlined, ArrowLeftOutlined, CalendarOutlined, ArrowDownOutlined, UpOutlined } from "@ant-design/icons";
import { useAuth } from "utils/hooks/useAuth";
import {
  fetchAccountById,
  sendNotifyUnreadMessage,
  sendInviteMail,
  fetchAppointmentsByMentorId,
  fetchAppointmentsByMenteeId,
  fetchAvailability,
  downloadBlob,
  getLibraryFile,
} from "utils/api";
import { formatAppointments } from "utils/dateFormatting";
import MenteeAppointmentModal from "./MenteeAppointmentModal";
import socketInvite from "utils/socket";
import AvailabilityCalendar from "components/AvailabilityCalendar";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import { css } from "@emotion/css";

function MessagesChatArea(props) {
  const {
    token: { colorPrimaryBg },
  } = theme.useToken();
  const { t } = useTranslation();
  const queryParameters = new URLSearchParams(window.location.search);
  const messageId = queryParameters.get("message_id");
  const { socket } = props;
  const { TextArea } = Input;
  const { profileId, isMentee, isMentor, isPartner } = useAuth();
  const [messageText, setMessageText] = useState("");
  const [accountData, setAccountData] = useState(null);
  const [isAlreadyInvited, setIsAlreadyInvited] = useState(false);
  const [isAlreadyInvitedByMentor, setIsAlreadyInvitedByMentor] =
    useState(false);
  const [updateContent, setUpdateContent] = useState(false);
  const [isOpenCalendarModal, setIsOpenCalendarModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [availabeInFuture, setAvailabeInFuture] = useState([]);
  const [bookedData, setBookedData] = useState({});
  const isMobile = useMediaQuery({ query: `(max-width: 761px)` });
  var total_index = 0;
  const {
    messages,
    activeMessageId,
    otherId,
    userType,
    loading,
    isBookingVisible,
    inviteeId,
    restrictedPartners,
    user,
    messagesPagination,
    loadOlderMessages,
    jumpToLatest,
    dateFilter,
    setDateFilter,
    loadConversation
  } = props;
  const messagesEndRef = useRef(null);
  const messagesStartRef = useRef(null);
  const buttonRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [showJumpButton, setShowJumpButton] = useState(false);
  const [isDateFilterVisible, setIsDateFilterVisible] = useState(false);
  const [reachedBeginning, setReachedBeginning] = useState(false);
  
  const scrollToBottom = () => {
    if (messagesEndRef.current != null) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  };
  
  // Handle scroll events to detect when user has scrolled up
  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const scrollPosition = scrollHeight - scrollTop - clientHeight;
    
    // Show jump button when scrolled up more than 300px from bottom
    setShowJumpButton(scrollPosition > 300);
    
    // We don't automatically load more messages when scrolling to the top
    // This will be handled by a button instead
  }, []);
  
  // Apply date filters and reload messages
  const applyDateFilter = (dates) => {
    if (!dates || !dates[0] || !dates[1]) {
      setDateFilter({
        startDate: null,
        endDate: null,
      });
      
      // If clearing filters, reload conversation
      loadConversation(otherId);
    } else {
      setDateFilter({
        startDate: dates[0].startOf('day'),
        endDate: dates[1].endOf('day'),
      });
      
      // Reload conversation with new filters
      loadConversation(otherId, {
        after: dates[0].startOf('day').toISOString(),
        before: dates[1].endOf('day').toISOString()
      });
    }
    
    setIsDateFilterVisible(false);
  };

  function scrollToElement(id) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }

  useEffect(() => {
    async function fetchAccount() {
      var account = null;
      if (user && user.pair_partner && user.pair_partner.restricted) {
        var same_kind_user_ids = [];
        if (
          user.pair_partner.assign_mentees &&
          user.pair_partner.assign_mentees.length > 0
        ) {
          user.pair_partner.assign_mentees.map((item) => {
            same_kind_user_ids.push(item.id);
            return false;
          });
        }
        if (
          user.pair_partner.assign_mentors &&
          user.pair_partner.assign_mentors.length > 0
        ) {
          user.pair_partner.assign_mentors.map((item) => {
            same_kind_user_ids.push(item.id);
            return false;
          });
        }
        if (same_kind_user_ids.includes(otherId)) {
          account = await fetchAccountById(otherId, userType);
        }
      } else {
        if (restrictedPartners && restrictedPartners.length > 0) {
          var restricted_user_ids = [];
          restrictedPartners.map((partner_item) => {
            if (partner_item.assign_mentors) {
              partner_item.assign_mentors.map((assign_item) => {
                restricted_user_ids.push(assign_item.id);
                return false;
              });
            }
            if (partner_item.assign_mentees) {
              partner_item.assign_mentees.map((assign_item) => {
                restricted_user_ids.push(assign_item.id);
                return false;
              });
            }
            return false;
          });
          if (!restricted_user_ids.includes(otherId)) {
            account = await fetchAccountById(otherId, userType);
          }
        } else {
          account = await fetchAccountById(otherId, userType);
        }
      }
      if (account) {
        setAccountData(account);
        if (parseInt(userType, 10) === ACCOUNT_TYPE.MENTEE) {
          setIsAlreadyInvitedByMentor(
            account.favorite_mentors_ids.indexOf(otherId) >= 0
          );
        }
      }
      if (parseInt(userType, 10) === ACCOUNT_TYPE.MENTOR) {
        var profileAcount = await fetchAccountById(
          profileId,
          ACCOUNT_TYPE.MENTEE
        );
        if (profileAcount) {
          setIsAlreadyInvited(
            profileAcount.favorite_mentors_ids.indexOf(otherId) >= 0
          );
        }
      }
    }
    fetchAccount();
  }, [updateContent, otherId, messages, profileId, restrictedPartners, user, userType]);

  useEffect(() => {
    if (messageId) {
      if (!messages?.length) return;
      scrollToElement(messageId);
    } else if (!messagesPagination?.loading) {
      scrollToBottom();
    }
    
    // Check if we've reached the beginning of the conversation
    if (messages?.length > 0 && messagesPagination?.total === messages.length) {
      setReachedBeginning(true);
    } else {
      setReachedBeginning(false);
    }
  }, [loading, messages, messageId, messagesPagination]);
  
  // Add scroll event listener to chat container
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const getAppointments = useCallback(async () => {
    const mentorID = profileId;
    var formattedAppointments = {};
    if (isMentor) {
      const appointmentsResponse = await fetchAppointmentsByMentorId(mentorID);

      formattedAppointments = formatAppointments(
        appointmentsResponse,
        ACCOUNT_TYPE.MENTOR
      );
    } else if (isMentee) {
      const appointmentsResponse = await fetchAppointmentsByMenteeId(mentorID);

      formattedAppointments = formatAppointments(
        appointmentsResponse,
        ACCOUNT_TYPE.MENTOR
      );
    }
    const booked_data = {};
    var tmp_avails = [];
    if (formattedAppointments) {
      if (isMentor) {
        tmp_avails = formattedAppointments["upcoming"];
      }
      if (isMentee) {
        formattedAppointments["pending"].map((item) => {
          tmp_avails.push(item);
          return true;
        });

        formattedAppointments["upcoming"].map((item) => {
          tmp_avails.push(item);
          return true;
        });
      }
      setAppointments(tmp_avails);
      if (tmp_avails) {
        tmp_avails.map((item) => {
          item.appointments.map((appoint_item) => {
            booked_data[
              moment
                .parseZone(appoint_item.timeslot.start_time.$date)
                .local()
                .format("YY-MM-DD H:mm")
            ] = true;
            return true;
          });
          return true;
        });
        setBookedData(booked_data);
      }
    }
  }, [profileId, isMentor, isMentee]);
  
  const getAvailableInFuture = useCallback(async () => {
    const availability_data = await fetchAvailability(profileId);
    const now = moment();

    const future_availables = [];
    if (availability_data) {
      const availability = availability_data.availability;
      availability.forEach((time) => {
        // Checking if saved or set have date already
        var starttime = moment(time.start_time.$date);
        if (
          !bookedData.hasOwnProperty(
            moment
              .parseZone(time.start_time.$date)
              .local()
              .format("YY-MM-DD H:mm")
          ) &&
          starttime.isSameOrAfter(now)
        ) {
          future_availables.push(time);
        }
      });
    }
    setAvailabeInFuture(future_availables);
  }, [profileId, bookedData]);

  useEffect(() => {
    if (isOpenCalendarModal === false) {
      getAppointments();
      getAvailableInFuture();
    }
  }, [isOpenCalendarModal, getAppointments, getAvailableInFuture]);

  const handleUpdateAccount = () => {
    setUpdateContent(!updateContent);
  };
  const handleSuccessBooking = (chatMsg) => {
    let dateTime = moment().utc();
    const msg = {
      body: chatMsg,
      message_read: false,
      sender_id: profileId,
      recipient_id: activeMessageId,
      time: dateTime,
    };
    socket.emit("send", msg);
    msg["sender_id"] = { $oid: msg["sender_id"] };
    msg["recipient_id"] = { $oid: msg["recipient_id"] };
    msg.time = moment().local().format("LLL");
    props.addMyMessage(msg);
    setMessageText("");
    getAppointments();
    getAvailableInFuture();
    return;
  };
  /*
    To do: Load user on opening. Read from mongo and also connect to socket.
  */

  const sendInvite = (e) => {
    const inviteMsg = {
      sender_id: profileId,
      recipient_id: activeMessageId,
    };
    socketInvite.emit("invite", inviteMsg);
    let dateTime = moment().utc();
    var availabes_in_future = [];
    availabeInFuture.map((avail_item, index) => {
      if (index < 5) {
        availabes_in_future.push(avail_item);
      }
      return true;
    });
    const msg = {
      body: t("messages.sendInviteBody"),
      message_read: false,
      sender_id: profileId,
      recipient_id: activeMessageId,
      time: dateTime,
      availabes_in_future: availabes_in_future,
    };
    socket.emit("send", msg);
    setTimeout(() => {
      sendInviteMail(activeMessageId, profileId, availabes_in_future);
    }, 1000);
    msg["sender_id"] = { $oid: msg["sender_id"] };
    msg["recipient_id"] = { $oid: msg["recipient_id"] };
    msg.time = moment().local().format("LLL");
    props.addMyMessage(msg);
    setMessageText("");
    return;
  };

  const showSideBar = () => {
    if (isMobile) {
      var sidebar = document.getElementsByClassName("ant-layout-sider");
      if (sidebar.length > 0) {
        sidebar[0].style.display = "block";
      }
    }
  };

  const sendMessage = (e) => {
    let currentMessage = messageText;
    if (!currentMessage.trim().length) {
      return;
    }
    let dateTime = moment().utc();
    const msg = {
      body: currentMessage,
      message_read: false,
      sender_id: profileId,
      recipient_id: activeMessageId,
      time: dateTime,
    };
    socket.emit("send", msg);
    setTimeout(() => {
      sendNotifyUnreadMessage(activeMessageId);
    }, 1000);
    msg["sender_id"] = { $oid: msg["sender_id"] };
    msg["recipient_id"] = { $oid: msg["recipient_id"] };
    msg.time = moment().local().format("LLL");
    props.addMyMessage(msg);
    setMessageText("");
    return;
  };
  if (loading) {
    return (
      <div className="no-messages" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        {isMobile && (
          <div
            onClick={showSideBar}
            style={{ cursor: "pointer", width: "20px", fontSize: "16px", position: 'absolute', top: '15px', left: '15px' }}
          >
            <ArrowLeftOutlined />
          </div>
        )}
        <Spin size="large" />
        <div style={{ marginTop: '20px', fontSize: '16px', color: 'rgba(0, 0, 0, 0.65)' }}>
          Loading conversation...
        </div>
      </div>
    );
  }
  
  if (!activeMessageId || !messages || !messages.length) {
    return (
      <div className="no-messages">
        {isMobile && (
          <div
            onClick={showSideBar}
            style={{ cursor: "pointer", width: "20px", fontSize: "16px" }}
          >
            <ArrowLeftOutlined />
          </div>
        )}
        <div className="start-convo">{t("messages.startConversation")}</div>
      </div>
    );
  }

  const styles = {
    bubbleSent: css`
      float: right;
      clear: right;
      background-color: ${colorPrimaryBg};
    `,
    bubbleReceived: css`
      float: left;
      clear: left;
      background-color: #f4f5f9;
    `,
  };

  const linkify = (text) => {
    const urlPattern =
      /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    return text.replace(urlPattern, '<a href="$1" target="_blank">$1</a>');
  };

  const HtmlContent = ({ content }) => {
    const handleDownload = async (id, file_name) => {
      let response = await getLibraryFile(id);
      downloadBlob(response, file_name);
    };
    const downloadFile = (message_body) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(message_body, "text/html");

      // Get the <a> element
      const link = doc.querySelector("a");
      if (link) {
        const altValue = link.getAttribute("alt"); // "Example Link"
        const file_name = link.textContent; // "Click here"

        if (altValue.includes("download_file_")) {
          let file_id = altValue.replace("download_file_", "");
          handleDownload(file_id, file_name);
        }
      }
    };
    return (
      <div
        onClick={() => downloadFile(content)}
        style={{
          wordBreak: isMobile ? "break-word" : "normal",
          fontSize: "15px",
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  };

  return (
    <div className="conversation-container">
      {accountData ? (
        <div className="messages-chat-area-header">
          {isMobile && (
            <div
              onClick={showSideBar}
              style={{ cursor: "pointer", width: "20px", fontSize: "16px" }}
            >
              <ArrowLeftOutlined />
            </div>
          )}
          <NavLink
            to={`/gallery/${userType ? userType : ACCOUNT_TYPE.HUB}/${
              accountData._id.$oid
            }`}
          >
            <Avatar size={60} src={accountData.image?.url} />
          </NavLink>
          <div className="messages-chat-area-header-info">
            <div className="messages-chat-area-header-name">
              {isPartner
                ? accountData.organization
                : accountData.name
                ? accountData.name
                : accountData.organization}
            </div>
            <div className="messages-chat-area-header-title">
              {isPartner
                ? accountData.intro
                : accountData.professional_title
                ? accountData.professional_title
                : accountData.intro}
            </div>
            
            {/* Date Filter Button */}
            <div className="date-filter-button">
              <Tooltip title="Filter by date">
                <Button 
                  icon={<CalendarOutlined />} 
                  onClick={() => setIsDateFilterVisible(!isDateFilterVisible)}
                  type={dateFilter.startDate ? "primary" : "default"}
                  size="small"
                >
                  Date Filter
                </Button>
              </Tooltip>
            </div>
            
            {/* Date Filter Dropdown */}
            {isDateFilterVisible && (
              <div className="date-filter-container">
                <Space direction="vertical" size={12}>
                  <DatePicker.RangePicker 
                    onChange={applyDateFilter}
                    value={[dateFilter.startDate, dateFilter.endDate]}
                    allowClear
                    style={{ width: '100%' }}
                  />
                  <div className="date-filter-actions">
                    <Button size="small" onClick={() => setIsDateFilterVisible(false)}>
                      Cancel
                    </Button>
                    <Button 
                      size="small" 
                      type="primary" 
                      onClick={() => applyDateFilter(null)}
                      disabled={!dateFilter.startDate && !dateFilter.endDate}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </Space>
              </div>
            )}
            {((isBookingVisible && inviteeId === otherId) ||
              isAlreadyInvited) && (
              <div className="mentor-profile-book-appt-btn">
                <MenteeAppointmentModal
                  mentor_name={accountData.name}
                  availability={accountData.availability}
                  mentor_id={otherId}
                  mentee_id={profileId}
                  handleUpdateMentor={handleUpdateAccount}
                  handleSuccessBooking={handleSuccessBooking}
                />
              </div>
            )}
            <div style={{ display: "flex", marginTop: "5px" }}>
              {isMentor && (
                <div style={{ marginRight: "10px" }}>
                  <Button
                    onClick={() => {
                      setIsOpenCalendarModal(true);
                    }}
                    type="primary"
                  >
                    {t("messages.availability")}
                  </Button>
                </div>
              )}
              {isMentor &&
                !isAlreadyInvitedByMentor &&
                !isPartner &&
                availabeInFuture.length > 0 && (
                  <div>
                    <Button onClick={sendInvite} type="primary">
                      {t("messages.sendInvite")}
                    </Button>
                  </div>
                )}
            </div>
          </div>
        </div>
      ) : (
        <div></div>
      )}
      <div className="conversation-content" ref={chatContainerRef}>
          {/* Loading older messages indicator */}
          {messagesPagination?.loading && (
            <div className="messages-loading-more" ref={messagesStartRef}>
              <Spin size="small" />
              <span>Loading older messages...</span>
            </div>
          )}
          
          {/* Reached beginning of conversation message */}
          {reachedBeginning && messages.length > 0 && (
            <Alert
              message="You've reached the beginning of the conversation"
              type="info"
              showIcon
              className="conversation-beginning-alert"
            />
          )}
          
          {/* Load more button - only show if not loading and has more messages */}
          {!messagesPagination?.loading && messagesPagination?.hasMore && (
            <div className="load-more-container" style={{ textAlign: 'center', padding: '15px 0' }}>
              <Button 
                onClick={() => loadOlderMessages(otherId)} 
                icon={<UpOutlined />}
                type="primary"
                ghost
              >
                Load More Messages
              </Button>
            </div>
          )}
          
          {/* Loading indicator for pagination */}
          {messagesPagination?.loading && (
            <div style={{ textAlign: 'center', padding: '15px 0' }}>
              <Spin size="small" /> <span style={{ marginLeft: '10px' }}>Loading older messages...</span>
            </div>
          )}
          
          {/* No messages placeholder */}
          {messages.length === 0 && !loading && (
            <div className="no-messages-placeholder">
              <p>No messages found</p>
              {dateFilter.startDate && (
                <p>Try adjusting your date filter</p>
              )}
            </div>
          )}
          
          {accountData &&
            messages.map((block, index) => {
              return (
                <div
                  className={`chatRight__items you-${
                    block.sender_id.$oid === profileId ? "sent" : "received"
                  }`}
                  id={block?._id?.$oid || index}
                >
                  <div
                    className={`chatRight__inner  message-area ${
                      block.sender_id.$oid !== profileId
                        ? "flex-start"
                        : "flex-end"
                    }`}
                    data-chat="person1"
                  >
                    <div className="flex">
                      {block.sender_id.$oid !== profileId && (
                        <span>
                          <Avatar src={accountData.image?.url} />{" "}
                        </span>
                      )}
                      <div className="convo">
                        <div
                          className={css`
                            padding: 5px 15px;
                            border-radius: 5px;
                            margin-left: 8px;
                            width: fit-content;
                            white-space: pre-wrap;
                            ${block.sender_id.$oid === profileId
                              ? styles.bubbleSent
                              : styles.bubbleReceived}
                          `}
                        >
                          <HtmlContent content={linkify(block.body)} />
                          {block.availabes_in_future !== undefined &&
                            block.availabes_in_future !== null &&
                            block.availabes_in_future.length > 0 &&
                            block.availabes_in_future.map((available_item) => {
                              total_index++;
                              return (
                                <>
                                  {block.sender_id.$oid === profileId ||
                                  bookedData.hasOwnProperty(
                                    moment
                                      .parseZone(
                                        available_item.start_time.$date
                                      )
                                      .local()
                                      .format("YY-MM-DD H:mm")
                                  ) ? (
                                    <div>
                                      {moment
                                        .parseZone(
                                          available_item.start_time.$date
                                        )
                                        .local()
                                        .format("LLL")}{" "}
                                      ~{" "}
                                      {moment
                                        .parseZone(
                                          available_item.end_time.$date
                                        )
                                        .local()
                                        .format("LT")}
                                    </div>
                                  ) : (
                                    <MenteeAppointmentModal
                                      mentor_name={accountData.name}
                                      availability={block.availabes_in_future}
                                      selected_availability={available_item}
                                      mentor_id={otherId}
                                      mentee_id={profileId}
                                      handleUpdateMentor={handleUpdateAccount}
                                      handleSuccessBooking={
                                        handleSuccessBooking
                                      }
                                      btn_title={
                                        moment
                                          .parseZone(
                                            available_item.start_time.$date
                                          )
                                          .local()
                                          .format("LLL") +
                                        " ~ " +
                                        moment
                                          .parseZone(
                                            available_item.end_time.$date
                                          )
                                          .local()
                                          .format("LTS")
                                      }
                                      index={total_index}
                                    />
                                  )}
                                </>
                              );
                            })}
                        </div>
                      </div>
                    </div>

                    <span style={{ opacity: "40%" }}>
                      {block.time
                        ? block.time
                        : moment
                            .utc(block.created_at.$date)
                            .local()
                            .format("LLL")}
                    </span>
                  </div>
                </div>
              );
            })}
          <div ref={messagesEndRef} />
      </div>
      <div className="conversation-footer">
        {accountData && (
          <>
            <TextArea
              style={{ width: "calc(100% - 220px" }}
              className="message-input"
              placeholder={t("messages.sendMessagePlaceholder")}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              autoSize={{ minRows: 1, maxRows: 3 }}
            />
            <Button
              id="sendMessagebtn"
              onClick={sendMessage}
              className={css`
                margin-left: 0.5em;
                padding: 0.5em;
              `}
              shape="default"
              type="primary"
              ref={buttonRef}
              icon={<SendOutlined rotate={315} />}
              size={48}
            >
              {t("messages.send")}
            </Button>
            
            {/* Jump to latest button */}
            {showJumpButton && (
              <Tooltip title="Jump to latest messages">
                <Button 
                  className="jump-to-latest-button"
                  shape="circle" 
                  type="primary"
                  icon={<ArrowDownOutlined />} 
                  onClick={() => {
                    // First clear any date filters
                    setDateFilter({
                      startDate: null,
                      endDate: null,
                    });
                    
                    // Then jump to latest messages
                    jumpToLatest();
                    
                    // Finally scroll to bottom
                    setTimeout(() => {
                      scrollToBottom();
                    }, 100);
                  }}
                  style={{
                    position: 'absolute',
                    bottom: '80px',
                    right: '20px',
                    zIndex: 10,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                  }}
                />
              </Tooltip>
            )}
          </>
        )}
      </div>

      {isMobile ? (
        // TODO: Consolidate the modal and drawer into one component
        <Drawer
          width={"100%"}
          title={t("messages.availabilityTitle")}
          open={isOpenCalendarModal}
          onClose={() => setIsOpenCalendarModal(false)}
          footer={[
            <Button
              type="primary"
              onClick={() => {
                setIsOpenCalendarModal(false);
              }}
            >
              {t("common.cancel")}
            </Button>,
          ]}
        >
          <AvailabilityCalendar appointmentdata={appointments} />
        </Drawer>
      ) : (
        <Modal
          className="calendar-modal"
          title={t("messages.availabilityTitle")}
          open={isOpenCalendarModal}
          onCancel={() => setIsOpenCalendarModal(false)}
          footer={[
            <Button
              type="primary"
              onClick={() => {
                setIsOpenCalendarModal(false);
              }}
            >
              {t("common.cancel")}
            </Button>,
          ]}
        >
          <AvailabilityCalendar appointmentdata={appointments} />
        </Modal>
      )}
    </div>
  );
}
export default withRouter(MessagesChatArea);
