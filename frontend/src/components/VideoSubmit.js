import React, { useState, useEffect } from "react";
import { Button, Form, Input, Select } from "antd";
import { getDisplaySpecializations } from "utils/api";
import { formatDropdownItems } from "utils/inputs";
import "../components/css/Videos.scss";
import ReactPlayer from "react-player";

const VideoSubmit = (props) => {
  const [specMasters, setSpecMasters] = useState([]);
  useEffect(() => {
    async function getMasters() {
      setSpecMasters(await getDisplaySpecializations());
    }
    getMasters();
  }, []);
  return (
    <div className="video-submit-card">
      <div className="video-submit-title">Add Video</div>
      <div
        style={{
          padding: "16px",
        }}
      >
        <Form
          form={props.form}
          name="video-submit"
          initialValues={{
            remember: true,
          }}
          onFinish={props.handleSubmitVideo}
        >
          <Form.Item
            name="title"
            className="video-submit-input"
            rules={[
              {
                required: true,
                message: "Please input a video title",
              },
            ]}
          >
            <Input placeholder="Video Title (e.g. 'Welcome!', 'How to do taxes')" />
          </Form.Item>
          <Form.Item
            name="url"
            className="video-submit-input"
            rules={[
              {
                required: true,
                message: "Please input a valid video link",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || ReactPlayer.canPlay(getFieldValue("url"))) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Please input a valid video link")
                  );
                },
              }),
            ]}
          >
            <Input placeholder="Video Link" />
          </Form.Item>
          <Form.Item
            name="tag"
            className="video-submit-input"
            rules={[
              {
                required: true,
                message: "Please select a tag",
              },
            ]}
          >
            <Select
              placeholder="Specializations"
              className="video-submit-input"
            >
              {formatDropdownItems(specMasters)}
            </Select>
          </Form.Item>
          <Form.Item className="video-submit-input">
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default VideoSubmit;
