import React, { useEffect, useState } from "react";
import { List, Button, Skeleton, Checkbox } from "antd";
import {
  getTrainings,
  downloadBlob,
  getTrainVideo,
  getSignedDocfile,
  changeStateTraining,
} from "utils/api";
import { useMediaQuery } from "react-responsive";

import "./css/TrainingList.scss";
import { ACCOUNT_TYPE, TRAINING_TYPE } from "utils/consts";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import DigitalSignModal from "./DigitalSignModal";
import ReactPlayer from "react-player/youtube";

const placeholder = Array(5).fill({
  _id: {
    $oid: "Lorem ipsum dolor sit amet",
  },
  description: "Mentee Handbook first trainingg",
  file_name: "Mentee_Handbook.pdf",
  name: "Mentee Handbook",
  role: "2",
  typee: "LINK",
  url: "https://4x.ant.design/components/form/#API",
});

const TrainingList = (props) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery({ query: `(max-width: 540px)` });
  const [trainingData, setTrainingData] = useState();
  const [openSignModal, setOpenSignModal] = useState(false);
  const [selectedTrainid, setSelectedTrainid] = useState(null);
  const [reload, setReload] = useState(false);

  const [traingStatus, setTrainingStatus] = useState(
    props.applicationData && props.applicationData.traingStatus
      ? props.applicationData.traingStatus
      : {}
  );
  const [flag, setFlag] = useState(false);
  const { user } = useSelector((state) => state.user);

  const changeTraingStatus = (id, value) => {
    if (
      props.applicationData.application_state === "BuildProfile" ||
      props.applicationData.application_state === "COMPLETED"
    ) {
      return;
    }
    let traing_status = traingStatus;
    let all_checked_flag = true;
    traing_status[id] = value;
    trainingData.map((training_item) => {
      if (traing_status[training_item.id] !== true) {
        all_checked_flag = false;
      }
      return true;
    });
    changeStateTraining(
      props.applicationData._id.$oid,
      props.role,
      traing_status
    );
    props.allChecked(all_checked_flag);
    setTrainingStatus(traing_status);
    setFlag(!flag);
  };

  const getTrainingComponent = (training) => {
    if (
      training.requried_sign &&
      training.typee === TRAINING_TYPE.DOCUMENT &&
      (!training.signed_data || !training.signed_data[training._id.$oid])
    ) {
      return (
        <>
          <Button
            type="primary"
            onClick={() => {
              setOpenSignModal(true);
              setSelectedTrainid(training._id.$oid);
            }}
          >
            Sign
          </Button>
        </>
      );
    } else {
      switch (training.typee) {
        case TRAINING_TYPE.VIDEO:
          return (
            <>
              <ReactPlayer
                className="react-player"
                width={isMobile ? 340 : 400}
                height={300}
                url={training.url}
              />
              <br />
              {props.applicationData && (
                <Checkbox
                  style={{ marginTop: "12px" }}
                  className=""
                  onChange={(e) => {
                    changeTraingStatus(training.id, e.target.checked);
                  }}
                  checked={
                    traingStatus[training.id]
                      ? traingStatus[training.id]
                      : false
                  }
                >
                  {t("traing.completed")}
                </Checkbox>
              )}
            </>
          );
        case TRAINING_TYPE.LINK:
          return (
            <>
              <a className="external-link" href={training.url} target="_blank">
                {training.url}
              </a>
              <br />
              {props.applicationData && (
                <Checkbox
                  style={{ marginTop: "12px" }}
                  className=""
                  onChange={(e) => {
                    changeTraingStatus(training.id, e.target.checked);
                  }}
                  checked={
                    traingStatus[training.id]
                      ? traingStatus[training.id]
                      : false
                  }
                >
                  {t("traing.completed")}
                </Checkbox>
              )}
            </>
          );
        case TRAINING_TYPE.DOCUMENT:
          return (
            <>
              <Button
                onClick={async () => {
                  let response = null;
                  if (training.signed_data[training._id.$oid]) {
                    response = await getSignedDocfile(
                      training.signed_data[training._id.$oid].$oid
                    );
                  } else {
                    response = await getTrainVideo(training.id);
                  }
                  downloadBlob(response, training.file_name);
                }}
              >
                {training.file_name}
              </Button>
              <br />
              {props.applicationData && (
                <Checkbox
                  style={{ marginTop: "12px" }}
                  className=""
                  onChange={(e) => {
                    changeTraingStatus(training.id, e.target.checked);
                  }}
                  checked={
                    traingStatus[training.id]
                      ? traingStatus[training.id]
                      : false
                  }
                >
                  {t("traing.completed")}
                </Checkbox>
              )}
            </>
          );
        default:
          return null;
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    getTrainings(
      props.role,
      user ? user.email : props.user_email,
      user ? user._id.$oid : null
    )
      .then((trains) => {
        if (props.role == ACCOUNT_TYPE.HUB && user) {
          var hub_user_id = null;
          if (user.hub_id) {
            hub_user_id = user.hub_id;
          } else {
            hub_user_id = user._id.$oid;
          }
          setTrainingData(
            trains
              .sort((a, b) => a.sort_order - b.sort_order)
              .filter((x) => x.hub_id == hub_user_id)
          );
        } else {
          setTrainingData(trains.sort((a, b) => a.sort_order - b.sort_order));
        }
        setLoading(false);
        setFlag(!flag);
      })
      .catch((e) => console.error(e));
  }, [i18n.language, user, reload]);

  useEffect(() => {
    setTimeout(() => {
      setTrainingStatus(
        props.applicationData && props.applicationData.traingStatus
          ? props.applicationData.traingStatus
          : {}
      );
    }, 1500);
  }, [props.applicationData]);

  return (
    <>
      <List
        itemLayout="vertical"
        size="large"
        dataSource={trainingData ?? placeholder}
        renderItem={(item) => (
          <List.Item style={{ padding: isMobile && 0 }} key={item._id.$oid}>
            <Skeleton loading={loading} active>
              <List.Item.Meta
                title={item.name}
                description={item.description}
              />
              {getTrainingComponent(item)}
            </Skeleton>
          </List.Item>
        )}
      />
      <DigitalSignModal
        role={props.role}
        email={props.user_email ? props.user_email : user ? user.email : null}
        train_id={selectedTrainid}
        open={openSignModal}
        finish={() => {
          setReload(!reload);
          setOpenSignModal(false);
          setSelectedTrainid(null);
        }}
      />
    </>
  );
};

export default TrainingList;
