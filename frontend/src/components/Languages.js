import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchOptions } from "features/optionsSlice";
import {
  deleteLanguageByID,
  EditLanguageById,
  getLanguageById,
  fetchAdminLanguages,
  newLanguageCreate,
  translateOption,
} from "utils/api";
import { Input, Form, Button } from "antd";
import { Table, Popconfirm, message, Modal } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";

import "./css/Trains.scss";
import { OPTION_TYPE } from "utils/consts";

export const Languages = () => {
  const [data, setData] = useState([]);
  const [err, setErr] = useState(false);
  const [reload, setReload] = useState(true);
  const [name, setName] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [errMessage, setErrorMessage] = useState(null);
  const [selectedID, setSelectedID] = useState("");
  const dispatch = useDispatch();

  const showModal = async (id, isNew) => {
    if (isNew === false) {
      setIsModalVisible(true);
      setSelectedID(id);
      let record = await getLanguageById(id);
      if (record) {
        setName(record.name);
      }
    } else {
      setIsModalVisible2(true);
      setName("");
      setSelectedID("");
    }
  };

  const handleOk = async (isNew) => {
    if (!name) {
      setErr(true);
      setErrorMessage("Please Fill Input Cell");
      return;
    } else {
      setErr(false);
    }

    if (isNew === true) {
      let record = await newLanguageCreate(name);
      if (record) {
        setErr(false);
        setIsModalVisible2(false);
      } else {
        setErr(true);
        setErrorMessage("Couldn' save changes");
      }
    } else {
      let record = await EditLanguageById(selectedID, name);
      if (record) {
        setErr(false);
        setIsModalVisible(false);
      } else {
        setErr(true);
        setErrorMessage("Couldn' save changes");
      }
    }

    dispatch(fetchOptions());
    setReload(!reload);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsModalVisible2(false);
  };

  // const handleTranslate = () => {
  //   console.log(selectedID);
  //   const result = translateOption(OPTION_TYPE.LANGUAGE, selectedID);
  //   if (result) {
  //     message.success("Translation has been done successfully");
  //   } else {
  //     message.error("Translation has failed");
  //   }
  // };

  const LanguageForm = () => (
    <Form className="trainForm">
      <p>Name *</p>
      <Input
        placeholder="Name *"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {/* <Button onClick={() => handleTranslate()}>Translate</Button> */}
    </Form>
  );

  const columns = [
    {
      title: "No",
      dataIndex: "custom_index",
      key: "custom_index",
      width: "5%",
      render: (custom_index) => custom_index,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name) => <span>{name}</span>,
    },
    {
      title: "Delete",
      dataIndex: "id",
      key: "id",
      render: (id) => (
        <Popconfirm
          title={`Are you sure you want to delete this value? Please note that there could be users already using this value.`}
          onConfirm={() => {
            deleteData(id);
          }}
          onCancel={() => message.info(`No deletion has been for `)}
          okText="Yes"
          cancelText="No"
        >
          <DeleteOutlined className="delete-user-btn" />
        </Popconfirm>
      ),
      align: "center",
      width: "10%",
    },
    {
      title: "Edit",
      dataIndex: "id",
      key: "id",
      render: (id) => (
        <>
          <Modal
            title="Language"
            visible={isModalVisible}
            onOk={() => handleOk(false)}
            onCancel={handleCancel}
            okText="save"
            closable={false}
            width={"600px"}
            className={id}
            mask={false}
          >
            {" "}
            {LanguageForm()}
            {err ? <p className="error">{errMessage}</p> : ""}
          </Modal>
          <EditOutlined
            className="delete-user-btn"
            onClick={() => showModal(id, false)}
          />
        </>
      ),

      align: "center",
      width: "10%",
    },
  ];
  const deleteData = async (id) => {
    const success = await deleteLanguageByID(id);
    if (success) {
      message.success(`Successfully deleted `);
      setReload(!reload);
    } else {
      message.error(`Could not delete `);
    }
  };
  useEffect(() => {
    const getData = async () => {
      let dataa = await fetchAdminLanguages();
      if (dataa) {
        setData(dataa);
      } else {
        setErr(true);
      }
    };
    getData();
  }, [reload]);
  return (
    <div className="trains">
      <div className="rolesContainer">
        <div className="table-button-group">
          <Button
            className="table-button"
            icon={<PlusCircleOutlined />}
            onClick={() => {
              showModal("", true);
            }}
          >
            New Language
          </Button>
        </div>
      </div>
      <div className="trainTable">
        <Table columns={columns} dataSource={data} />
      </div>
      <Modal
        title="Language"
        visible={isModalVisible2}
        onOk={() => handleOk(true)}
        onCancel={handleCancel}
        okText="save"
        closable={false}
        width={"600px"}
      >
        {LanguageForm()}
        {err ? <p className="error">{errMessage}</p> : ""}
      </Modal>
    </div>
  );
};
