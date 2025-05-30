import React, { useState, useEffect } from "react";
import { Button, Breadcrumb, Input, Spin, message } from "antd";
import {
  DownloadOutlined,
  ReloadOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "../css/AdminAccountData.scss";
import {
  fetchMentorsAppointments,
  downloadMentorsData,
  downloadMenteesData,
  deleteAccountById,
  fetchMenteesAppointments,
  fetchAccounts,
  downloadPartnersData,
} from "../../utils/api";
import {
  MenteeMentorDropdown,
  SortByApptDropdown,
  HubsDropdown,
} from "../AdminDropdowns";
import UploadEmails from "../UploadEmails";
import AddGuestModal from "../AddGuestModal";
import AdminDataTable from "../AdminDataTable";
import { useAuth } from "utils/hooks/useAuth";
import { ACCOUNT_TYPE } from "utils/consts";

const keys = {
  MENTORS: 0,
  MENTEES: 1,
  PARTNER: 2,
  // ALL: 3,
  GUEST: 4,
  SUPPORT: 5,
  MODERATOR: 7,
  ASCENDING: 0,
  DESCENDING: 1,
};

function AdminAccountData() {
  const [isReloading, setIsReloading] = useState(false);
  const [isMentorDownload, setIsMentorDownload] = useState(false);
  const [isMenteeDownload, setIsMenteeDownload] = useState(false);
  const [isPartnerDownload, setIsPartnerDownload] = useState(false);
  const [reload, setReload] = useState(true);
  const [displayData, setDisplayData] = useState([]);
  const [displayOption, setDisplayOption] = useState(keys.MENTORS);
  const [filterData, setFilterData] = useState([]);
  const [downloadFile, setDownloadFile] = useState(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [guestModalVisible, setGuestModalVisible] = useState(false);
  const { onAuthStateChanged } = useAuth();
  const [hubOptions, setHubOptions] = useState([]);
  const [resetFilters, setResetFilters] = useState(false);
  const [searchHubUserId, setSearchHubUserId] = useState(null);

  useEffect(() => {
    async function getHubData() {
      var temp = [];
      const hub_data = await fetchAccounts(ACCOUNT_TYPE.HUB);
      hub_data.map((hub_item) => {
        temp.push({ label: hub_item.name, value: hub_item._id.$oid });
        return true;
      });
      setHubOptions(temp);
    }
    getHubData();
  }, []);

  useEffect(() => {
    async function getData() {
      setIsReloading(true);

      switch (displayOption) {
        case keys.MENTEES:
          const menteeRes = await fetchMenteesAppointments();
          if (menteeRes) {
            const newMenteeData = menteeRes.menteeData.map((elem) => ({
              ...elem,
              isMentee: true,
            }));
            setDisplayData(newMenteeData);
            setFilterData(newMenteeData);
          } else {
            message.error("Could not fetch account data");
          }
          break;
        case keys.MENTORS:
          const mentorRes = await fetchMentorsAppointments();
          if (mentorRes) {
            setDisplayData(mentorRes.mentorData);
            setFilterData(mentorRes.mentorData);
          } else {
            message.error("Could not fetch account data");
          }
          break;
        case keys.PARTNER:
          const Partners = await fetchAccounts(ACCOUNT_TYPE.PARTNER);
          var partners_data = [];
          if (Partners) {
            Partners.map((item) => {
              item.restricted_show = item.restricted ? "Yes" : "No";
              item.mentor_nums = item.assign_mentors
                ? item.assign_mentors.length
                : 0;
              item.mentee_nums = item.assign_mentees
                ? item.assign_mentees.length
                : 0;
              partners_data.push(item);
              return true;
            });
          }

          setDisplayData(partners_data);
          setFilterData(partners_data);
          break;
        case keys.GUEST:
          const Guests = await fetchAccounts(ACCOUNT_TYPE.GUEST);

          setDisplayData(Guests);
          setFilterData(Guests);
          break;
        case keys.SUPPORT:
          const Supporters = await fetchAccounts(ACCOUNT_TYPE.SUPPORT);

          setDisplayData(Supporters);
          setFilterData(Supporters);
          break;
        case keys.MODERATOR:
          const Moderator = await fetchAccounts(ACCOUNT_TYPE.MODERATOR);
          setDisplayData(Moderator);
          setFilterData(Moderator);
          break;
        default:
          break;
      }
      setIsReloading(false);
    }

    onAuthStateChanged(getData);
  }, [reload]);

  const handleDeleteAccount = async (id, accountType, name) => {
    const success = await deleteAccountById(id, accountType);
    if (success) {
      message.success(`Successfully deleted ${name}`);
      setReload(!reload);
    } else {
      message.error(`Could not delete ${name}`);
    }
  };

  const handleAddAccount = () => {
    setUploadModalVisible(true);
  };

  const handleAddGuest = () => {
    setGuestModalVisible(true);
  };

  const handleMentorsDownload = async () => {
    setIsMentorDownload(true);
    const file = await downloadMentorsData();
    setDownloadFile(file);
    setIsMentorDownload(false);
  };

  const handleMenteesDownload = async () => {
    setIsMenteeDownload(true);
    const file = await downloadMenteesData();
    setDownloadFile(file);
    setIsMenteeDownload(false);
  };
  const handlePartnersDownload = async () => {
    setIsPartnerDownload(true);
    const file = await downloadPartnersData(searchHubUserId);
    setDownloadFile(file);
    setIsPartnerDownload(false);
  };

  const handleSortData = (key) => {
    const newData = [...filterData];
    const isAscending = key === keys.ASCENDING;
    newData.sort((a, b) => {
      if (a.appointments && b.appointments) {
        return isAscending
          ? b.appointments.length - a.appointments.length
          : a.appointments.length - b.appointments.length;
      } else {
        return isAscending
          ? b.numOfAppointments - a.numOfAppointments
          : a.numOfAppointments - b.numOfAppointments;
      }
    });
    setFilterData(newData);
  };

  const handleAccountDisplay = (key) => {
    setDisplayOption(key);
    handleResetFilters();
    setReload(!reload);
  };

  const searchbyHub = (key) => {
    if (!key || displayOption !== keys.PARTNER) {
      setFilterData(displayData);
      return;
    }
    setSearchHubUserId(key);
    let newFiltered = [];
    newFiltered = displayData.filter((account) => {
      return account.hub_id === key;
    });
    setFilterData(newFiltered);
  };

  const handleSearchByPartner = (partner_name) => {
    if (!partner_name) {
      setFilterData(displayData);
      return;
    }
    let newFiltered = [];
    if (displayOption === keys.MENTORS || displayOption === keys.MENTEES) {
      newFiltered = displayData.filter((account) => {
        return account.partner.match(new RegExp(partner_name, "i"));
      });
      setFilterData(newFiltered);
    }
  };

  const handleSearchAccount = (name) => {
    if (!name) {
      setFilterData(displayData);
      return;
    }
    let newFiltered = [];
    if (displayOption !== keys.PARTNER) {
      newFiltered = displayData.filter((account) => {
        return account.name.match(new RegExp(name, "i"));
      });
    } else {
      newFiltered = displayData.filter((account) => {
        return account.organization.match(new RegExp(name, "i"));
      });
    }
    setFilterData(newFiltered);
  };

  const handleResetFilters = () => {
    setResetFilters(!resetFilters);
    setSearchHubUserId(null);
    if (displayOption === keys.PARTNER) {
      setFilterData(displayData);
    }
  };

  return (
    <div className="account-data-body">
      <div style={{ display: "none" }}>
        <iframe src={downloadFile} />
      </div>
      <Breadcrumb>
        <Breadcrumb.Item>User Reports</Breadcrumb.Item>
        <Breadcrumb.Item>
          <a href="account-data">Account Data</a>
        </Breadcrumb.Item>
      </Breadcrumb>
      <div
        className="table-search flex table-button-group"
        style={{ width: "25rem" }}
      >
        <Input.Search
          placeholder="Search by name"
          id="search"
          prefix={<UserOutlined />}
          allowClear
          size="medium"
          onSearch={(value) => handleSearchAccount(value)}
        />
        <div style={{ lineHeight: "30px", marginLeft: "1rem" }}>Hub</div>
        <HubsDropdown
          className="table-button hub-drop-down"
          options={hubOptions}
          onChange={(key) => searchbyHub(key)}
          onReset={resetFilters}
        />
        <Button className="" onClick={() => handleResetFilters()}>
          Clear Filters
        </Button>
        {(displayOption === keys.MENTORS || displayOption === keys.MENTEES) && (
          <Input.Search
            style={{ marginLeft: "2rem" }}
            placeholder="Search by Partner affiliated"
            id="search"
            prefix={<UserOutlined />}
            allowClear
            size="medium"
            onSearch={(value) => handleSearchByPartner(value)}
          />
        )}
      </div>
      <div className="table-header">
        <div className="table-title">
          {displayOption === keys.MENTORS
            ? "Mentors"
            : displayOption === keys.MENTEES
            ? "Mentees"
            : displayOption === keys.PARTNER
            ? "Partners"
            : displayOption === keys.GUEST
            ? "Guests"
            : displayOption === keys.SUPPORT
            ? "Supporters"
            : displayOption === keys.MODERATOR
            ? "Moderators"
            : "All"}
        </div>
        <div className="table-button-group">
          <MenteeMentorDropdown
            className="table-button"
            onChange={(key) => handleAccountDisplay(key)}
          />
          <SortByApptDropdown
            className="table-button"
            onChange={(key) => handleSortData(key)}
            onChangeData={displayData}
          />
          <Button
            className="table-button"
            icon={<PlusOutlined />}
            onClick={() => handleAddGuest()}
          >
            Add New Guest/Support/Moderator
          </Button>
          <AddGuestModal
            setGuestModalVisible={setGuestModalVisible}
            guestModalVisible={guestModalVisible}
            refresh={() => setReload(!reload)}
          />
          <Button
            className="table-button"
            icon={<PlusOutlined />}
            onClick={() => handleAddAccount()}
          >
            Add New Account
          </Button>
          <UploadEmails
            setUploadModalVisible={setUploadModalVisible}
            uploadModalVisible={uploadModalVisible}
          />
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
          <Button
            className="table-button"
            icon={<DownloadOutlined />}
            onClick={() => handlePartnersDownload()}
            loading={isPartnerDownload}
          >
            Partner Account Data
          </Button>

          <ReloadOutlined
            className="table-button"
            style={{ fontSize: "16px" }}
            spin={isReloading}
            onClick={() => {
              setReload(!reload);
            }}
          />
        </div>
      </div>
      <Spin spinning={isReloading}>
        <AdminDataTable
          data={filterData}
          deleteAccount={handleDeleteAccount}
          refresh={() => setReload(!reload)}
          isMentee={displayOption === keys.MENTEES}
          isPartner={displayOption === keys.PARTNER}
          isGuest={displayOption === keys.GUEST}
          isSupport={displayOption === keys.SUPPORT}
          isModerator={displayOption === keys.MODERATOR}
        />
      </Spin>
    </div>
  );
}

export default AdminAccountData;
