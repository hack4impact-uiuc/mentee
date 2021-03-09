import React, { useState, useEffect } from "react";
import { Table, Button, Breadcrumb, Input, Spin } from "antd";
import {
  DownloadOutlined,
  ReloadOutlined,
  LinkOutlined,
  PlusOutlined,
  UserOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import "../css/AdminAccountData.scss";
import { fetchMentorsAppointments, downloadMentorsData } from "../../utils/api";
import { formatLinkForHref } from "utils/misc";
import { MenteeMentorDropdown, SortByApptDropdown } from "../AdminDropdowns";
import { PROFILE_URL } from "../../utils/consts";

const { Column } = Table;

const keys = {
  MENTORS: 0,
  MENTEES: 1,
  ALL: 2,
  ASCENDING: 0,
  DESCENDING: 1,
};

function AdminAccountData() {
  const [isReloading, setIsReloading] = useState(false);
  const [isMentorDownload, setIsMentorDownload] = useState(false);
  const [isMenteeDownload, setIsMenteeDownload] = useState(false);
  const [reload, setReload] = useState(true);
  const [resetFilters, setResetFilters] = useState(false);
  const [mentorData, setMentorData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [displayOption, setDisplayOption] = useState(keys.MENTORS);
  const [filterData, setFilterData] = useState([]);

  useEffect(() => {
    async function getData() {
      setIsReloading(true);
      const res = await fetchMentorsAppointments();
      if (res) {
        setMentorData(res.mentorData);
        // TODO: Add Mentee Data state
        setDisplayData(res.mentorData);
        setFilterData(res.mentorData);
      }
      setIsReloading(false);
    }
    getData();
  }, [reload]);

  const handleDeleteAccount = (mentorId) => {
    // TODO: Create endpoint that deletes a mentor account
    setReload(!reload);
    console.log(`Deleting Mentor with ID: ${mentorId}`);
  };

  const handleAddAccount = () => {
    // TODO: Link to the modal or page where one can add a new account
    console.log("Adding new account!");
  };

  const handleMentorsDownload = async () => {
    setIsMentorDownload(true);
    // TODO: Check up on why this isn't working..
    await downloadMentorsData();
    setIsMentorDownload(false);
  };

  const handleMenteesDownload = () => {
    setIsMentorDownload(true);
    // TODO: Add Mentee Account Downloads
    console.log("Calling endpoint to download accounts");
    setIsMenteeDownload(false);
  };

  const handleSortData = (key) => {
    const newData = [...filterData];
    const isAscending = key === keys.ASCENDING;
    newData.sort((a, b) => {
      return isAscending
        ? b.appointments.length - a.appointments.length
        : a.appointments.length - b.appointments.length;
    });
    setFilterData(newData);
  };

  const handleAccountDisplay = (key) => {
    let newData = [];
    if (key === keys.MENTORS) {
      newData = mentorData;
    } else if (key === keys.MENTEES) {
      //TODO: Add Mentee Data
    } else if (key === keys.ALL) {
      // TODO: Add Mentee Data
      newData = mentorData.concat([]);
    }

    setDisplayData(newData);
    setFilterData(newData);
    setDisplayOption(key);
  };

  const handleSearchAccount = (name) => {
    if (!name) {
      setFilterData(displayData);
      return;
    }

    let newFiltered = displayData.filter((account) => {
      return account.name.match(new RegExp(name, "i"));
    });
    setFilterData(newFiltered);
  };

  return (
    <div className="account-data-body">
      <Breadcrumb>
        <Breadcrumb.Item>User Reports</Breadcrumb.Item>
        <Breadcrumb.Item>
          <a href="account-data">Account Data</a>
        </Breadcrumb.Item>
      </Breadcrumb>
      <div className="table-search">
        <Input.Search
          placeholder="Search by name"
          prefix={<UserOutlined />}
          allowClear
          size="medium"
          onSearch={(value) => handleSearchAccount(value)}
        />
      </div>
      <div className="table-header">
        <div className="table-title">
          {displayOption === keys.MENTORS
            ? "Mentors"
            : displayOption === keys.MENTEES
            ? "Mentees"
            : "All"}
        </div>
        <div className="table-button-group">
          <MenteeMentorDropdown
            className="table-button"
            onChange={(key) => handleAccountDisplay(key)}
            onReset={resetFilters}
          />
          <SortByApptDropdown
            className="table-button"
            onChange={(key) => handleSortData(key)}
            onReset={resetFilters}
            onChangeData={displayData}
          />
          <Button
            className="table-button"
            icon={<PlusOutlined />}
            onClick={() => handleAddAccount()}
          >
            Add New Account
          </Button>
          <Button
            className="table-button"
            icon={<DownloadOutlined />}
            onClick={() => handleMentorsDownload()}
            loading={isMentorDownload}
          >
            Mentor Account Data
          </Button>
          <Button
            className="table-button"
            icon={<DownloadOutlined />}
            onClick={() => handleMenteesDownload()}
            loading={isMenteeDownload}
          >
            Mentee Account Data
          </Button>
          <ReloadOutlined
            className="table-button"
            style={{ fontSize: "16px" }}
            spin={isReloading}
            onClick={() => {
              setReload(!reload);
              setResetFilters(!resetFilters);
            }}
          />
        </div>
      </div>
      <Spin spinning={isReloading}>
        <Table dataSource={filterData}>
          <Column title="Name" dataIndex="name" key="name" />
          <Column
            title="No. of Appointments"
            dataIndex="numOfAppointments"
            key="numOfAppointments"
            align="center"
          />
          <Column
            title="Appointment Details"
            dataIndex="appointments"
            key="appointments"
            render={(appointments) => (
              <a className="table-appt-view" props={appointments}>
                View
              </a>
            )}
            align="center"
          />
          <Column
            title="Delete"
            dataIndex="id"
            key="id"
            render={(mentorId) => (
              <DeleteOutlined
                className="delete-user-btn"
                onClick={() => handleDeleteAccount(mentorId)}
              />
            )}
            align="center"
          />
          <Column
            title="Link to Profile"
            dataIndex="id"
            key="id"
            render={(id) => (
              <a
                style={{ color: "black" }}
                href={formatLinkForHref(`${PROFILE_URL}/${id}`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkOutlined /> {`${PROFILE_URL}/${id}`}
              </a>
            )}
            align="center"
          />
        </Table>
      </Spin>
    </div>
  );
}

export default AdminAccountData;
