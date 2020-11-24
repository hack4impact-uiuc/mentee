import React from "react";
import { Row, Col } from "antd";
import ReactPlayer from "react-player";

import "./css/PublicProfile.scss";

function ProfileVideos(props) {
  const renderVideoGrid = () => {
    if (!props.videos || props.videos.length <= 1) return;

    const pairReducer = (aggregator, current, index) => {
      index % 2 === 0
        ? aggregator.push([current])
        : aggregator[aggregator.length - 1].push(current);
      return aggregator;
    };
    const rows = props.videos.slice(1).reduce(pairReducer, []);

    return rows.map((row) => (
      <>
        <Row gutter={16}>
          {row.map((video) => (
            <Col span={12}>
              <div className="video-default-preview">
                <ReactPlayer
                  url={video.url}
                  width="100%"
                  height="100%"
                  className="video-border"
                />
              </div>
              <div>
                <b>{video.title}</b>
                <br />
                {video.tag}
              </div>
            </Col>
          ))}
        </Row>
        <br />
      </>
    ));
  };

  return (
    <div>
      <h1>
        <b>Videos</b>
      </h1>
      <hr className="mentor-profile-videos-divider" />
      <Row>
        <Col span={24}>
          <div className="pinned-video-default-preview">
            {props.videos && props.videos[0] && (
              <ReactPlayer
                url={props.videos[0].url}
                width="100%"
                height="100%"
                className="video-border"
              />
            )}
          </div>
          {props.videos && props.videos[0] && (
            <div>
              <b>{props.videos[0].title}</b>
              <br />
              {props.videos[0].tag}
            </div>
          )}
        </Col>
      </Row>
      <br />
      {renderVideoGrid()}
    </div>
  );
}

export default ProfileVideos;
