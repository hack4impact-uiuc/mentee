import React, { useState, useEffect } from "react";
import moment from "moment";
import { Breadcrumb, Input, Button, Row, Col, Spin } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { UserOutlined } from "@ant-design/icons";
import {
  fetchPaginatedAppointments,
  downloadAllApplicationData,
} from "../../utils/api";
import { SortByDateDropdown, SpecializationsDropdown } from "../AdminDropdowns";
import AdminAppointmentCard from "../AdminAppointmentCard";
import "../css/AdminAppointments.scss";
import { SPECIALIZATIONS } from "utils/consts";
import useAuth from "utils/hooks/useAuth";

const keys = {
  ASCENDING: 0,
  DESCENDING: 1,
};

function AdminAppointmentData() {
  const [isLoading, setIsLoading] = useState(false);
  const [resetFilters, setResetFilters] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [render, setRender] = useState(false);
  const [isDownloadingAppointments, setIsDownloadingAppointments] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [downloadFile, setDownloadFile] = useState(null);
  const [searchValue, setSearchValue] = useState("NONE")
  const [filterValue, setFilterValue] = useState("NONE")

  const { onAuthStateChanged } = useAuth();

  useEffect(() => {
    async function getAppointments() {
      setIsLoading(true);
      const res = await fetchPaginatedAppointments(pageNumber, searchValue, filterValue);

      if (res) {
        const sorted = res.appointments.reverse();
        setAppointments(sorted);
        setAppointmentCount(res.totalAppointments);
      }
      setIsLoading(false);
    }

    onAuthStateChanged(getAppointments);
  }, [pageNumber, searchValue, filterValue]);

  const incrementPageNumber = () => {
    if (pageNumber * 12 < appointmentCount) {
      setPageNumber(pageNumber+1)
    }
  }
  const decrementPageNumber = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber-1)
    }
  }

  const handleSearchAppointment = (searchVal) => {
    if (searchVal != "") {
      setSearchValue(searchVal)
    } else {
      setSearchValue("NONE")
    }
    setPageNumber(1)
  };
  const handleResetFilters = () => {
    if (filterValue != "NONE") {
      setFilterValue("NONE")
      setPageNumber(1)
    }
  };
  const handleSortData = (sortingKey) => {
    const isAscending = sortingKey === keys.ASCENDING;
    const newSorted = appointments.sort((a, b) => {
      const aDate = moment(a.appointment.timeslot.start_time.$date);
      const bDate = moment(b.appointment.timeslot.start_time.$date);
      return isAscending ? bDate.diff(aDate) : aDate.diff(bDate);
    });
    setRender(!render);
    setAppointments(newSorted);
  };
  const handleSpecializationsDisplay = (index) => {
    setFilterValue(SPECIALIZATIONS[index])
    setPageNumber(1)
  };

  const handleAppointmentDownload = async () => {
    setIsDownloadingAppointments(true);
    const file = await downloadAllApplicationData();
    setDownloadFile(file);
    setIsDownloadingAppointments(false);
  };

  return (
    <div className="appointments-body">
      <div style={{ display: "none" }}>
        <iframe src={downloadFile} />
      </div>
      <Breadcrumb>
        <Breadcrumb.Item>User Reports</Breadcrumb.Item>
        <Breadcrumb.Item>
          <a href="all-appointments">All Appointments</a>
        </Breadcrumb.Item>
      </Breadcrumb>
      <div className="table-header">
        <div className="appointment-search">
          <Input.Search
            placeholder="Search by name"
            prefix={<UserOutlined />}
            allowClear
            size="medium"
            onSearch={(value) => handleSearchAppointment(value)}
          />
        </div>
        <div className="table-button-group">
          <SpecializationsDropdown
            className="table-button"
            onChange={(key) => handleSpecializationsDisplay(key)}
            onReset={resetFilters}
          />
          <SortByDateDropdown
            className="table-button"
            onChange={(key) => handleSortData(key)}
            onReset={resetFilters}
          />
          <Button className="table-button" onClick={() => handleResetFilters()}>
            Clear Filters
          </Button>
          <Button
            className="table-button"
            icon={<DownloadOutlined />}
            onClick={() => handleAppointmentDownload()}
            loading={isDownloadingAppointments}
          >
            Appointment Data
          </Button>
          <Button onClick={() => decrementPageNumber()}>
            Prev Page
          </Button>
          <Button onClick={() => incrementPageNumber()}>
            Next Page
          </Button>
        </div>
      </div>
      <Spin spinning={isLoading} size="large" style={{ height: "100vh" }}>
        <div className="appointments-table">
          <Row gutter={[16, 16]} justify="start">
            {appointments.map((data) => {
              return (
                <Col span={6}>
                  <AdminAppointmentCard data={data} render={render} />
                </Col>
              );
            })}
          </Row>
        </div>
      </Spin>
    </div>
  );
}

export default AdminAppointmentData;
