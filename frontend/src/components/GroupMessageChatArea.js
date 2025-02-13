import React, { useEffect, useState, useRef } from "react";
import { Avatar, Input, Button, Spin, theme, Dropdown } from "antd";
import { withRouter, NavLink } from "react-router-dom";
import moment from "moment-timezone";
import { SendOutlined } from "@ant-design/icons";
import EmojiPicker from "emoji-picker-react";
import { useAuth } from "utils/hooks/useAuth";
import { sendNotifyUnreadMessage } from "utils/api";
import { useTranslation } from "react-i18next";
import { css } from "@emotion/css";
import { ACCOUNT_TYPE } from "utils/consts";

function GroupMessageChatArea(props) {
  const {
    token: { colorPrimaryBg },
  } = theme.useToken();
  const { t } = useTranslation();
  const { socket } = props;
  const { TextArea } = Input;
  const { profileId } = useAuth();
  const [messageText, setMessageText] = useState("");
  const [replyMessageText, setReplyMessageText] = useState("");
  const [messageTitle, setMessageTitle] = useState("");

  const { messages, loading, hub_user_id, particiants } = props;
  const messagesEndRef = useRef(null);
  const buttonRef = useRef(null);
  const [dotMenuFlags, setDotMenuFlags] = useState({});
  const [replyInputFlags, setReplyInputFlags] = useState({});
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiUp, setEmojiUp] = useState(false);
  const [showReplyEmojiPicker, setShowReplyEmojiPicker] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(true);
  const [expandedMessages, setExpandedMessages] = useState({});
  const [groupUsers, setGroupUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(null);
  const [activeInput, setActiveInput] = useState(null);
  const textAreaRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current != null) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  };

  function sortParentChild(items) {
    const map = new Map();

    // Populate map with each item by id for quick access
    items.forEach((item) =>
      map.set(item._id ? item._id.$oid : null, { ...item, children: [] })
    );

    const sortedArray = [];

    // Loop through items and place them under their parent
    items.forEach((item) => {
      if (item.parent_message_id) {
        const parent = map.get(item.parent_message_id);
        if (parent) {
          if (item._id) {
            parent.children.push(map.get(item._id.$oid));
          } else {
            parent.children.push(item);
          }
        }
      } else {
        sortedArray.push(map.get(item._id?.$oid ?? null));
      }
    });

    return sortedArray;
  }

  useEffect(() => {
    if (shouldScroll) {
      scrollToBottom();
    }
  }, [loading, messages, shouldScroll]);

  useEffect(() => {
    const content = document.querySelector(".conversation-content");
    if (content) {
      const handleScroll = () => {
        const isAtBottom =
          content.scrollHeight - content.scrollTop <=
          content.clientHeight + 100;
        setShouldScroll(isAtBottom);
      };
      content.addEventListener("scroll", handleScroll);
      return () => content.removeEventListener("scroll", handleScroll);
    }
  }, []);

  useEffect(() => {
    if (particiants) {
      // Ensure each participant has a name property before filtering
      const filteredUsers = particiants
        .filter(user => user && user._id && user._id.$oid !== profileId)
        .filter(user => user.name) // Only include users with a name property
        || [];
      setGroupUsers(filteredUsers);
    }
  }, [particiants, profileId]);

  useEffect(() => {
    console.log('Participants:', particiants); // Debug log
  }, [particiants]);

  const toggleExpand = (id) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const linkify = (text) => {
    const urlPattern =
      /(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|]/gi;
    return text.replace(urlPattern, '<a href="$1" target="_blank">$1</a>');
  };

  const sendMessage = (e) => {
    let currentMessage = messageText;
    if (!currentMessage.trim().length) {
      return;
    }

    let dateTime = moment().utc();
    const msg = {
      title: messageTitle.trim(),
      body: currentMessage,
      message_read: false,
      sender_id: profileId,
      hub_user_id: hub_user_id,
      parent_message_id: null,
      time: dateTime,
    };
    // Clear inputs immediately
    setMessageTitle("");
    setMessageText("");

    // Basic message emission
    socket.emit("sendGroup", msg);

    // Simple message display
    const displayMsg = {
      ...msg,
      _id: { $oid: Date.now().toString() },
      sender_id: { $oid: msg.sender_id },
      hub_user_id: { $oid: msg.hub_user_id },
      time: moment().local().format("LLL"),
    };

    props.addMyMessage(displayMsg);
    setShouldScroll(true);

    // Simple notification
    if (particiants?.length > 0) {
      setTimeout(() => {
        particiants.forEach((user) => {
          if (user._id.$oid !== profileId) {
            sendNotifyUnreadMessage(user._id.$oid);
          }
        });
      }, 0);
    }
  };

  const sendReplyMessage = (block_id) => {
    let currentMessage = replyMessageText;
    if (!currentMessage.trim().length) {
      let temp = replyInputFlags;
      temp[block_id] = false;
      setReplyInputFlags(temp);
      setRefreshFlag(!refreshFlag);
      return;
    }

    let dateTime = moment().utc();
    const msg = {
      body: currentMessage,
      message_read: false,
      sender_id: profileId,
      hub_user_id: hub_user_id,
      parent_message_id: block_id,
      time: dateTime,
    };

    // Clear input and close reply box
    setReplyMessageText("");
    setReplyInputFlags((prevFlags) => ({
      ...prevFlags,
      [block_id]: false,
    }));

    // Emit to the same channel as regular messages
    socket.emit("sendGroup", msg);

    // Format for local display
    const displayMsg = {
      ...msg,
      _id: { $oid: Date.now().toString() },
      sender_id: { $oid: msg.sender_id },
      hub_user_id: { $oid: msg.hub_user_id },
      parent_message_id: block_id,
      time: moment().local().format("LLL"),
    };

    // Add to local state
    props.addMyMessage(displayMsg);
    //setShouldScroll(true);

    // Send notifications
    if (particiants?.length > 0) {
      setTimeout(() => {
        particiants.forEach((user) => {
          if (user._id.$oid !== profileId) {
            sendNotifyUnreadMessage(user._id.$oid);
          }
        });
      }, 0);
    }
  };

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
    parentMessageContainer: css`
      border: 1px solid rgb(228, 227, 227); // Border for the entire parent message
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 10px;
      background-color: rgb(
        255,
        255,
        255
      ); // Background color for the container
    `,
    parentMessage: css`
      padding: 10px 15px;
      border-radius: 8px;
      background-color: #e6f7ff; // Example background color
      border: 1px solid #91d5ff; // Example border color
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); // Example shadow
    `,
    title: css`
      padding: 10px 10px;
      border-radius: 8px;
      margin-bottom: 4px;
      background-color: #ffbb91; // Updated background color for title
      font-weight: bold;
      color: #000; // Example text color
    `,
  };

  const changeDropdown = (block_id) => {
    setDotMenuFlags((prevFlags) => ({
      ...prevFlags,
      [block_id]: !prevFlags[block_id],
    }));
    setRefreshFlag(!refreshFlag);
  };

  const getDropdownMenuItems = (block) => {
    return [
      {
        key: "reply",
        label: (
          <span
            onClick={() => {
              setReplyInputFlags((prevFlags) => {
                const newFlags = { ...prevFlags };
                // Reset all flags to false
                Object.keys(newFlags).forEach((key) => {
                  newFlags[key] = false;
                });
                // Set current message's reply flag to true
                newFlags[block._id.$oid] = true;
                return newFlags;
              });
              setDotMenuFlags((prevFlags) => ({
                ...prevFlags,
                [block._id.$oid]: false,
              }));
              setReplyMessageText("");
              setShowEmojiPicker(false);
              setRefreshFlag(!refreshFlag);
            }}
          >
            {t("messages.reply")}
          </span>
        ),
      },
    ];
  };

  const HtmlContent = ({ content }) => {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  };

  const onEmojiClick = (event, kind = "main") => {
    if (kind === "main") {
      setMessageText((messageText) => messageText + event.emoji);
    } else {
      setReplyMessageText((replyMessageText) => replyMessageText + event.emoji);
    }
    setShowEmojiPicker(false); // Hide picker after selection
    setShowReplyEmojiPicker(false);
  };

  const handleInputChange = (e, type = 'main') => {
    const value = e.target.value;
    
    if (type === 'main') {
      setMessageText(value);
    } else {
      setReplyMessageText(value);
    }

    // Check for @ symbol
    if (value.endsWith('@')) {
      console.log('@ detected, showing user list');
      setActiveInput(type);
      setShowUserList(true);
      // Filter out users with undefined names and current user
      setFilteredUsers(particiants?.filter(user => 
        user && 
        user._id && 
        user._id.$oid !== profileId &&
        (user.name || user.person_name) // Check for both name fields
      ) || []);
    } 
    else if (showUserList) {
      const lastAtIndex = value.lastIndexOf('@');
      if (lastAtIndex !== -1) {
        const searchTerm = value.slice(lastAtIndex + 1).toLowerCase();
        const filtered = particiants?.filter(user => 
          user && 
          user._id && 
          user._id.$oid !== profileId &&
          (user.name || user.person_name) && // Check for both name fields
          (user.name?.toLowerCase().includes(searchTerm) || 
           user.person_name?.toLowerCase().includes(searchTerm))
        ) || [];
        setFilteredUsers(filtered);
      } else {
        setShowUserList(false);
      }
    }
  };

  const handleUserSelect = (user, type) => {
    // Get the appropriate name, fallback to person_name if name is not available
    const userName = user.name || user.person_name;
    if (!userName) return; // Don't proceed if no valid name is found

    const currentText = type === 'main' ? messageText : replyMessageText;
    const lastAtIndex = currentText.lastIndexOf('@');
    const newText = currentText.slice(0, lastAtIndex) + '@' + userName + ' ';
    
    if (type === 'main') {
      setMessageText(newText);
    } else {
      setReplyMessageText(newText);
    }
    
    setShowUserList(false);
  };

  const formatMessageText = (text) => {
    if (!text) return text;
    
    // First find all participants' names to match against
    const participantNames = particiants?.map(user => ({
      name: user.name || user.person_name,
      id: user._id.$oid
    })).filter(user => user.name) || [];

    // Sort names by length (longest first) to handle cases where one name contains another
    participantNames.sort((a, b) => b.name.length - a.name.length);

    let formattedText = text;
    
    // Replace each @mention with styled span
    participantNames.forEach(participant => {
      const mentionText = `@${participant.name}`;
      const regex = new RegExp(mentionText, 'g');
      formattedText = formattedText.replace(regex, 
        `<span class="tagged-user">${mentionText}</span>`
      );
    });

    return formattedText;
  };

  const renderMessages = (data, depth = 0) => {
    return data.map((block) => {
      let sender_user = particiants.find(
        (x) => x._id.$oid === block.sender_id.$oid
      );

      const isParent = !block.parent_message_id;

      return (
        <div className={isParent ? styles.parentMessageContainer : ""}>
          <div
            style={{ marginLeft: 50 * depth + "px" }}
            className="chatRight__items you-received"
          >
            <div
              className="chatRight__inner message-area flex-start"
              data-chat="person1"
            >
              <div className="flex">
                <span>
                  <NavLink
                    to={`/gallery/${
                      sender_user?.hub_user_id
                        ? ACCOUNT_TYPE.PARTNER
                        : ACCOUNT_TYPE.HUB
                    }/${block.sender_id.$oid}`}
                  >
                    <div style={{ width: "60px", textAlign: "center" }}>
                      <Avatar
                        src={sender_user?.image?.url}
                        style={{
                          cursor: "pointer",
                          width: "60px",
                          height: "60px",
                          border: "1.5px solid rgb(198, 204, 208)",
                          borderRadius: "50%",
                        }}
                      />
                    </div>
                  </NavLink>
                </span>
                <div className="convo" style={{ flex: 1, marginLeft: "10px" }}>
                  {block.title && (
                    <div className={styles.title}>{block.title}</div>
                  )}
                  <div
                    className={css`
                      ${styles.parentMessage}// Apply new parent message styles
                    `}
                  >
                    <div 
                      className="message-text"
                      dangerouslySetInnerHTML={{ 
                        __html: formatMessageText(block.body) 
                      }} 
                    />
                  </div>
                  <span
                    style={{
                      opacity: "40%",
                      display: "block",
                      marginTop: "12px",
                    }}
                  >
                    <NavLink
                      to={`/gallery/${
                        sender_user?.hub_user_id
                          ? ACCOUNT_TYPE.PARTNER
                          : ACCOUNT_TYPE.HUB
                      }/${block.sender_id.$oid}`}
                      style={{
                        color: "inherit",
                        textDecoration: "none",
                        fontWeight: "bold",
                      }}
                    >
                      {sender_user?.name || sender_user?.organization}
                    </NavLink>
                  </span>
                  <span
                    style={{
                      opacity: "40%",
                      display: "block",
                      marginTop: "4px",
                    }}
                  >
                    {block.time
                      ? block.time
                      : moment
                          .utc(block.created_at.$date)
                          .local()
                          .format("LLL")}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: "4px",
                    }}
                  >
                    <Button
                      onClick={() => {
                        setReplyInputFlags((prevFlags) => ({
                          ...prevFlags,
                          [block._id.$oid]: true,
                        }));
                        setReplyMessageText("");
                      }}
                      className="reply-button"
                      type="link"
                      style={{ padding: 0 }}
                    >
                      Reply
                    </Button>
                    {block.children && block.children.length > 0 && (
                      <Button
                        type="link"
                        onClick={() => toggleExpand(block._id.$oid)}
                        style={{ padding: 0, marginLeft: "10px" }}
                      >
                        {expandedMessages[block._id.$oid]
                          ? "-"
                          : `+ (${block.children.length})`}
                      </Button>
                    )}
                  </div>
                  {replyInputFlags[block._id.$oid] && (
                    <div className="reply-message-container" style={{ position: 'relative' }}>
                      <TextArea
                        className="reply-message-textarea"
                        value={replyMessageText}
                        onChange={(e) => handleInputChange(e, 'reply')}
                        autoSize={{ minRows: 1, maxRows: 3 }}
                      />
                      {renderUserList('reply')}
                      <img
                        alt=""
                        className="emoji-icon"
                        src="https://icons.getbootstrap.com/assets/icons/emoji-smile.svg"
                        onClick={() => {
                          setShowReplyEmojiPicker((val) => !val);
                          setShowEmojiPicker(false); // Ensure only one picker is open
                        }}
                      />
                      {showReplyEmojiPicker && (
                        <div
                          className={
                            emojiUp
                              ? "up emoji-container"
                              : "down emoji-container"
                          }
                        >
                          <EmojiPicker
                            onEmojiClick={(e) => onEmojiClick(e, "reply")}
                          />
                        </div>
                      )}
                      <Button
                        onClick={() => sendReplyMessage(block._id.$oid)}
                        className="reply-message-send-button"
                        shape="circle"
                        type="primary"
                        icon={<SendOutlined rotate={315} />}
                        size={32}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {block.children &&
            block.children.length > 0 &&
            expandedMessages[block._id.$oid] && (
              <div style={{ marginLeft: "20px" }}>
                {renderMessages(block.children, depth + 1)}
              </div>
            )}
        </div>
      );
    });
  };

  const renderUserList = (type) => {
    if (!showUserList || activeInput !== type || !filteredUsers.length) return null;
    
    return (
      <div 
        className="user-list-dropdown"
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1050
        }}
      >
        {filteredUsers.map(user => {
          const userName = user.name || user.person_name;
          if (!userName) return null; // Skip users without a valid name

          return (
            <div 
              key={user._id.$oid} 
              className="user-option"
              onClick={() => handleUserSelect(user, type)}
            >
              <Avatar size="small" src={user.image?.url} />
              <span>{userName}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="conversation-container">
      <div className="conversation-content group-conversation-content">
        <Spin spinning={loading}>
          {messages && renderMessages(sortParentChild(messages))}
        </Spin>
        <div ref={messagesEndRef} />
      </div>
      <div className="conversation-footer">
        <div className="message-input-container">
          {/* Title input */}
          <div className="title-container">
            <TextArea
              className="message-input title-input"
              placeholder={t("messages.titlePlaceholder")}
              value={messageTitle}
              onChange={(e) => setMessageTitle(e.target.value)}
              autoSize={{ minRows: 1, maxRows: 1 }}
              style={{ textAlign: "left" }}
            />
          </div>

          {/* Message input with icons */}
          <div className="message-with-icons">
            <TextArea
              ref={textAreaRef}
              className="message-input"
              placeholder={t("messages.sendMessagePlaceholder")}
              value={messageText}
              onChange={(e) => handleInputChange(e, 'main')}
              autoSize={{ minRows: 1, maxRows: 3 }}
              style={{ textAlign: "left" }}
            />
            
            <div className="message-icons">
              <img
                alt=""
                className="emoji-icon"
                src="https://icons.getbootstrap.com/assets/icons/emoji-smile.svg"
                onClick={() => {
                  setShowEmojiPicker((val) => !val);
                  setShowReplyEmojiPicker(false);
                }}
              />
              
              <Button
                onClick={sendMessage}
                className="send-button"
                shape="circle"
                type="primary"
                icon={<SendOutlined rotate={315} />}
                size={32}
              />
            </div>
          </div>
        </div>

        {showEmojiPicker && (
          <div className="emoji-container">
            <EmojiPicker onEmojiClick={(e) => onEmojiClick(e, "main")} />
          </div>
        )}
      </div>
    </div>
  );
}
export default withRouter(GroupMessageChatArea);
