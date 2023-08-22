import React, { useState } from "react";
import { Button, Form, Input, Modal, message } from "antd";
import moment from "moment";
import { useSelector } from "react-redux";
import { sendMessage } from "../utils/api";
import "./css/AntDesign.scss";
import "./css/Modal.scss";
import "./css/MenteeModal.scss";
import { useTranslation } from "react-i18next";

// TODO: Remove formModalVisible state and use open prop instead
function PublicMessageModal({ mentorId, menteeId, menteeName }) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const user = useSelector((state) => state.user.user);

  function closeModals() {
    setFormModalVisible(false);
    form.resetFields();
  }

  const handleSendMessage = async (values) => {
    setLoading(true);
    const data = {
      message: values.message,
      user_name: user?.name,
      user_id: mentorId,
      recipient_name: menteeName,
      recipient_id: menteeId,
      email: user?.email,
      link: user?.website ?? user?.linkedin ?? "",
      time: moment().format("YYYY-MM-DD, HH:mm:ssZZ"),
    };
    if (!(await sendMessage(data))) {
      messageApi.error("failed to send message");
      return;
    }
    messageApi.success("successfully sent message");
    setLoading(false);
    closeModals();
  };

  function onOk() {
    form
      .validateFields()
      .then((values) => {
        handleSendMessage(values);
      })
      .catch((info) => {
        console.error("Validate Failed:", info);
      });
  }

  return (
    <span>
      <Button
        type="primary"
        onClick={() => {
          setFormModalVisible(true);
        }}
      >
        {t("commonProfile.sendMessage")}
      </Button>
      <Modal
        title={t("common.message")}
        okText={t("common.submit")}
        open={formModalVisible}
        onCancel={closeModals}
        onOk={onOk}
        confirmLoading={loading}
      >
        {contextHolder}
        <Form id="message-form" form={form} layout="vertical">
          <Form.Item
            name="message"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </span>
  );
}

export default PublicMessageModal;
