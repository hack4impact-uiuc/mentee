import React, { useEffect, useState } from "react";
import {
  deleteTrainbyId,
  downloadBlob,
  EditTrainById,
  getTrainById,
  getTrainings,
  getTrainVideo,
  newTrainCreate,
  translateDocuments,
} from "utils/api";
import { ACCOUNT_TYPE, I18N_LANGUAGES, TRAINING_TYPE } from "utils/consts";
import {
  Table,
  Popconfirm,
  message,
  Modal,
  Select,
  Input,
  Radio,
  Form,
  Button,
  notification,
  Spin,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";

import "./css/Trains.scss";
import AdminDownloadDropdown from "./AdminDownloadDropdown";
import { parse } from "superagent";

export const Trainings = () => {
  const [role, setRole] = useState(null);
  const [data, setData] = useState([]);
  const [err, setErr] = useState(false);
  const [reload, setReload] = useState(true);
  const [name, setName] = useState(null);
  const [url, setUrl] = useState(null);
  const [desc, setDesc] = useState(null);
  const [trainRole, setTrainRole] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [isNewDocument, setIsNewDocument] = useState(false);
  const [errMessage, setErrorMessage] = useState(null);
  const [typee, setTypee] = useState(null);
  const [filee, setFilee] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [selectedID, setSelectedID] = useState("");
  const [loading, setLoading] = useState(false);
  const [translateLoading, setTranslateLoading] = useState(false);
  const { Option } = Select;

  const showModal = async (id, isNew) => {
    setIsNewDocument(false);
    if (isNew === false) {
      setIsModalVisible(true);
      setSelectedID(id);
      let train = await getTrainById(id);
      if (train) {
        setName(train.name);
        setDesc(train.description);
        setTrainRole(train.role);
        setTypee(train.typee);
        if (train.isVideo) {
          setUrl(train.url);
        } else {
          let response = await getTrainVideo(id);

          setFilee(response);
          setFileName(train.file_name);
        }
      }
    } else {
      setSelectedID("");
      setName("");
      setUrl("");
      setDesc("");
      setFilee(null);
      setTrainRole(null);
      setTypee(null);
      setIsModalVisible2(true);
    }
  };

  const handleOk = async (isNew) => {
    if (
      !name ||
      !desc ||
      !trainRole ||
      (typee !== TRAINING_TYPE.DOCUMENT && !url) ||
      (typee === !TRAINING_TYPE.DOCUMENT && !filee)
    ) {
      setErr(true);
      setErrorMessage("Please Fill Input Cell");
      return;
    } else {
      setErr(false);
    }

    console.log("saving changes");
    setLoading(true);
    let isVideo = typee !== TRAINING_TYPE.DOCUMENT;
    if (isNew === true) {
      let train = await newTrainCreate(
        name,
        url,
        desc,
        trainRole,
        isVideo,
        filee,
        typee
      );
      if (train) {
        setErr(false);
        setIsModalVisible2(false);
      } else {
        setErr(true);
        setErrorMessage("Couldn't save changes");
      }
    } else {
      let train = await EditTrainById({
        id: selectedID,
        name,
        url,
        desc,
        role: trainRole,
        isVideo,
        filee,
        typee,
        isNewDocument,
      });
      if (train) {
        setErr(false);
        setIsModalVisible(false);
      } else {
        setErr(true);
        setErrorMessage("Couldn't save changes");
      }
    }

    setReload(!reload);
    setLoading(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsModalVisible2(false);
  };

  const handleTrainingDownload = async (record, lang) => {
    let response = await getTrainVideo(record.id, lang);
    if (!response) {
      notification.error({
        message: "ERROR",
        description: "Couldn't download file",
      });
      return;
    }
    downloadBlob(response, record.file_name);
  };

  const deleteTrain = async (id) => {
    const success = await deleteTrainbyId(id);
    if (success) {
      message.success(`Successfully deleted `);
      setReload(!reload);
    } else {
      message.error(`Could not delete `);
    }
  };

  const getAvailableLangs = (record) => {
    if (!record?.translations) return [I18N_LANGUAGES[0]];
    let items = I18N_LANGUAGES.filter((lang) => {
      return (
        Object.keys(record?.translations).includes(lang.value) &&
        record?.translations[lang.value] !== null
      );
    });
    // Appends English by default
    items.unshift(I18N_LANGUAGES[0]);
    return items;
  };

  const TrainForm = () => (
    <Form className="trainForm">
      {loading ? (
        <h1>Loading ...</h1>
      ) : (
        <>
          <p>Name *</p>
          <Input
            placeholder="Name *"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <p>Training Type *</p>
          <Radio.Group
            onChange={(e) => setTypee(e.target.value)}
            value={typee}
            className="isVideo"
          >
            <Radio value={TRAINING_TYPE.VIDEO}>Video</Radio>
            <Radio value={TRAINING_TYPE.DOCUMENT}>Document</Radio>
            <Radio value={TRAINING_TYPE.LINK}>External Link</Radio>
          </Radio.Group>
          {typee !== TRAINING_TYPE.DOCUMENT ? (
            <>
              <p>Url *</p>
              <Input
                placeholder="Url *"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </>
          ) : (
            <>
              {" "}
              {filee && (
                <p>
                  <Button
                    onClick={() => {
                      downloadBlob(filee, fileName);
                    }}
                  >
                    {fileName}
                  </Button>
                </p>
              )}
              <p>PDF File*</p>
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  setIsNewDocument(true);
                  setFilee(e.target.files[0]);
                  console.log(e.target.files[0]);
                  setFileName(e.target.files[0].name);
                }}
              ></Input>
            </>
          )}

          <p>Description *</p>
          <Input
            placeholder="Description *"
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <p>Role *</p>
          <Select
            style={{ width: 120 }}
            onChange={(value) => setTrainRole(value)}
            placeholder="Role"
            value={trainRole ? parseInt(trainRole) : role}
          >
            <Option value={ACCOUNT_TYPE.MENTOR}>Mentor</Option>
            <Option value={ACCOUNT_TYPE.MENTEE}>Mentee</Option>
            <Option value={ACCOUNT_TYPE.PARTNER}>Partner</Option>
          </Select>
        </>
      )}
    </Form>
  );

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name) => <>{name}</>,
    },
    {
      title: "URL",
      dataIndex: "url",
      key: "url",
      render: (url, record) => {
        if (record.typee !== TRAINING_TYPE.DOCUMENT) {
          return (
            <a href={url} target="_blank">
              {url}
            </a>
          );
        } else {
          return (
            <AdminDownloadDropdown
              options={getAvailableLangs(record)}
              title="Download Document"
              onClick={(lang) => handleTrainingDownload(record, lang)}
            />
          );
        }
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description) => <>{description}</>,
    },
    {
      title: "Type",
      dataIndex: "typee",
      key: "typee",
      render: (typee) => <>{typee}</>,
    },
    {
      title: "Translate Document",
      dataIndex: "id",
      key: "id",
      render: (id, record) => (
        <Popconfirm
          title={`Are you sure you want to translate? ($0.08 per page per language)`}
          onConfirm={async () => {
            setTranslateLoading(true);
            const res = await translateDocuments(id);
            if (!res?.success) {
              notification.error({
                message: "ERROR",
                description: `Couldn't translate file`,
              });
            } else {
              notification.success({
                message: "SUCCESS",
                description: "Translation has been done successfully",
              });
            }
            setTranslateLoading(false);
          }}
          onCancel={() =>
            notification.info({
              message: "INFO",
              description: `No translation has been done for ${record.name}`,
            })
          }
          okText="Yes"
          cancelText="No"
          disabled={record.typee !== TRAINING_TYPE.DOCUMENT}
        >
          {record.typee === TRAINING_TYPE.DOCUMENT ? (
            <TeamOutlined className="delete-user-btn" />
          ) : (
            <TeamOutlined className="disabled-user-btn" />
          )}
        </Popconfirm>
      ),
      align: "center",
    },
    {
      title: "Edit",
      dataIndex: "id",
      key: "id",
      render: (id) => (
        <>
          <Modal
            title=""
            visible={isModalVisible}
            onOk={() => handleOk(false)}
            onCancel={handleCancel}
            okText="save"
            closable={false}
            width={"600px"}
            okButtonProps={{ disabled: loading ? true : false }}
          >
            {" "}
            {TrainForm()}
            {err ? <p className="error">{errMessage}</p> : ""}
          </Modal>
          <EditOutlined
            className="delete-user-btn"
            onClick={() => showModal(id, false)}
          />
        </>
      ),

      align: "center",
    },
    {
      title: "Delete",
      dataIndex: "id",
      key: "id",
      render: (id) => (
        <Popconfirm
          title={`Are you sure you want to delete ?`}
          onConfirm={() => {
            deleteTrain(id);
          }}
          onCancel={() => message.info(`No deletion has been for `)}
          okText="Yes"
          cancelText="No"
        >
          <DeleteOutlined className="delete-user-btn" />
        </Popconfirm>
      ),
      align: "center",
    },
  ];

  useEffect(() => {
    const getData = async () => {
      let newData = await getTrainings(role);
      if (newData) {
        setData(newData);
      } else {
        setErr(true);
      }
    };
    getData();
  }, [role, reload]);
  return (
    <div className="trains">
      <div className="rolesContainer">
        <Radio.Group
          className="roles"
          onChange={(e) => setRole(e.target.value)}
          value={role}
        >
          <Radio className="role" value={ACCOUNT_TYPE.MENTEE}>
            Mentee
          </Radio>
          <Radio className="role" value={ACCOUNT_TYPE.MENTOR}>
            Mentor
          </Radio>
          <Radio className="role" value={ACCOUNT_TYPE.PARTNER}>
            Partner
          </Radio>
        </Radio.Group>
        <div className="table-button-group">
          <Button
            className="table-button"
            icon={<PlusCircleOutlined />}
            onClick={() => {
              showModal("", true);
            }}
          >
            New Training
          </Button>
        </div>
      </div>
      <div className="trainTable">
        <Spin spinning={translateLoading}>
          <Table columns={columns} dataSource={data} />
        </Spin>
      </div>
      <Modal
        title=""
        visible={isModalVisible2}
        onOk={() => handleOk(true)}
        onCancel={handleCancel}
        okText="save"
        closable={false}
        width={"600px"}
        okButtonProps={{ disabled: loading ? true : false }}
      >
        {TrainForm()}
        {err ? <p className="error">{errMessage}</p> : ""}
      </Modal>
    </div>
  );
};
