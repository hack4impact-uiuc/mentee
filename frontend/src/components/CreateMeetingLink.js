import React, { useState, useEffect } from "react";
import { Modal, Button, Input, Typography, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { generateToken } from "utils/api";
import { useDispatch } from 'react-redux';
import { setPanel, removePanel } from 'features/meetingPanelSlice';
import { JaaSMeeting } from '@jitsi/react-sdk';

const { Title } = Typography;

function Meeting() {
  const [urlModalVisible, setUrlModalVisible] = useState(true);
  const [generatedRoomName, setGeneratedRoomName] = useState("");
  const [generatedToken, setGeneratedToken] = useState("");
  const [AppID, setGeneratedAppID] = useState("");
  const [reloadFlag, setReloadFlag] = useState(false);
  const { t } = useTranslation();
  const ReactAppID = process.env.REACT_APP_EIGHT_X_EIGHT_APP_ID;
  const dispatch = useDispatch();

  useEffect(() => {
    const roomNameFromLocalStorage = localStorage.getItem("roomName");
    if (roomNameFromLocalStorage) {
      setGeneratedRoomName(roomNameFromLocalStorage);
      localStorage.removeItem("roomName");
      while (!generatedRoomName){
        joinMeeting();  
      }
    }
  }, []);

  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(generatedRoomName);
      message.success(t("meeting.copyMessage"));
    } catch (error) {
      console.error(t("meeting.errorCopy"), error);
      message.error(t("meeting.errorCopy"));
    }
  };

  const getRoomName = () => {
    try {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let RoomName = '';
      for (let i = 0; i < 10; i++) {
        RoomName += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      setGeneratedRoomName(RoomName);
    } catch (error) {
      console.error(t("meeting.errorGenerating"));
      message.error(t("meeting.errorGenerating"));
    }
  };

  const createSidePanel = () => {
    return (
      <div>
        <JaaSMeeting
          getIFrameRef={iframeRef => {
            iframeRef.style.position = 'fixed';
            iframeRef.style.top = 0;
            iframeRef.style.right = 0;
            iframeRef.style.width = '30%';
            iframeRef.style.height = '100vh';
          }}
          appId={AppID}
          roomName={ReactAppID + '/' + generatedRoomName}
          jwt={generatedToken}
          configOverwrite={{
            disableThirdPartyRequests: true,
            disableLocalVideoFlip: true,
            backgroundAlpha: 0.5
          }}
          interfaceConfigOverwrite={{
            VIDEO_LAYOUT_FIT: 'nocrop',
            MOBILE_APP_PROMO: false,
            TILE_VIEW_MAX_COLUMNS: 4
          }}
        />
      </div>
    );
  };

  const joinMeeting = () => {
    try {
      if (!generatedRoomName) {
        console.error("Error: Room name is null or empty");
        message.error("Please provide a room name to join.");
        return;
      }
      getToken();
      dispatch(removePanel());
      document.body.style.marginRight = "30%";
      document.body.style.transition = "margin-right 0.3s";
      dispatch(setPanel(createSidePanel()));
    } catch (error) {
      console.error("Error: ", error);
      message.error("Unable to join meeting");
    }
  };

  const getToken = () => {
    try {
      if (reloadFlag) {
        localStorage.setItem("roomName", generatedRoomName);
        window.location.reload();
      }
      setReloadFlag(true);
      generateToken().then(resp => {
        setGeneratedToken(resp.token);
        setGeneratedAppID(resp.appID);
      }).catch(error => {
        console.error('Error:', error);
        message.error("Unable to generate token");
      });
    } catch (error) {
      console.error('Error:', error);
      message.error("Unable to generate token");
    }
  };

  return (
    <>
      <Modal
        title={t("meeting.title")}
        visible={urlModalVisible}
        onCancel={() => setUrlModalVisible(false)}
        footer={[
          <Button key="generate" type="primary" onClick={getRoomName}>
            {t("meeting.generateButton")}
          </Button>,
          <Button key="join" type="primary" onClick={joinMeeting}>
            {"Join Meeting"}
          </Button>,
          <Button key="cancel" onClick={() => setUrlModalVisible(false)}>
            {t("meeting.cancelButton")}
          </Button>,
        ]}
      >
        <div>
          <Title level={4}>{t("meeting.generatedURL")}</Title>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Input value={generatedRoomName} readOnly />
            <Button
              type="link"
              icon={<CopyOutlined />}
              onClick={copyToClipboard}
              style={{ marginLeft: "8px" }}
            />
          </div>
        </div>
        <div style={{ marginTop: "14px", fontSize: "12px" }}>
          {t("meeting.limitWarning")}
        </div>
      </Modal>
    </>
  );
}

export default Meeting;
