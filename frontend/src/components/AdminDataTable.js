import React from "react";
import { Table, Popconfirm, message } from "antd";
import { LinkOutlined, DeleteOutlined } from "@ant-design/icons";
import { JsonToTable } from "react-json-to-table";

import "./css/AdminAccountData.scss";
import { formatLinkForHref } from "utils/misc";
import { MENTEE_PROFILE, MENTOR_PROFILE, ACCOUNT_TYPE } from "utils/consts";

const { Column } = Table;

const getTableCompliant = (account) => {
  const newAccount = JSON.parse(JSON.stringify(account));
  Object.keys(newAccount).forEach((key) => {
    if (typeof newAccount[key] === "boolean") {
      newAccount[key] = newAccount[key] ? "Yes" : "No";
    }
  });
  return newAccount;
};

function AdminDataTable({ data, deleteAccount, isMentee }) {
  return (
    <Table
      dataSource={data}
      expandable={{
        expandedRowRender: (account) => (
          <JsonToTable json={getTableCompliant(account)} />
        ),
        rowExpandable: (account) => account.is_private,
      }}
      rowKey={(account) => account.id}
    >
      <Column title="Name" dataIndex="name" key="name" />
      <Column
        title="No. of Appointments"
        dataIndex="numOfAppointments"
        key="numOfAppointments"
        align="center"
      />
      {!isMentee && (
        <>
          <Column
            title="Appointments Available?"
            dataIndex="appointmentsAvailable"
            key="appointmentsAvailable"
            align="center"
            render={(text) => (text ? text : "N/A")}
          />
          <Column
            title="Videos Posted?"
            dataIndex="videosUp"
            key="videosUp"
            align="center"
            render={(text) => (text ? text : "N/A")}
          />
          <Column
            title="Picture Uploaded?"
            dataIndex="profilePicUp"
            key="profilePicUp"
            align="center"
            render={(text) => (text ? text : "N/A")}
          />
        </>
      )}

      <Column
        title="Delete"
        dataIndex={["id", "name"]}
        key="id"
        render={(text, data) => (
          <Popconfirm
            title={`Are you sure you want to delete ${data.name}?`}
            onConfirm={() => {
              deleteAccount(
                data.id,
                data.isMentee ? ACCOUNT_TYPE.MENTEE : ACCOUNT_TYPE.MENTOR,
                data.name
              );
            }}
            onCancel={() =>
              message.info(`No deletion has been for ${data.name}`)
            }
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined className="delete-user-btn" />
          </Popconfirm>
        )}
        align="center"
      />
      <Column
        title="Link to Profile"
        dataIndex="id"
        key="id"
        render={(id, data) => {
          const profileURL = data.isMentee
            ? `${MENTEE_PROFILE}${id}`
            : `${MENTOR_PROFILE}${id}`;

          return (
            !data.is_private && (
              <a
                style={{ color: "black" }}
                href={formatLinkForHref(profileURL)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkOutlined /> {profileURL}
              </a>
            )
          );
        }}
        align="center"
      />
    </Table>
  );
}

export default AdminDataTable;
