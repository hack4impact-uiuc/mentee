import React, { useEffect, useState } from "react";
import { MenuOutlined } from "@ant-design/icons";
import { message } from "antd";

import {
  fetchAppointmentsByMenteeId,
  getFavMentorsById,
  EditFavMentorById,
} from "utils/api";
import { formatAppointments } from "utils/dateFormatting";
import { ACCOUNT_TYPE, PROFILE_URL, APPOINTMENT_STATUS } from "utils/consts";
import OverlaySelect from "components/OverlaySelect";
import useAuth from "utils/hooks/useAuth";
import BookmarkSidebar from "components/BookmarkSidebar";

import "components/css/MenteeAppointments.scss";
import ApptData from "utils/MenteeApptsData.json";

const appointmentTabs = Object.freeze({
  upcoming: {
    text: "All Upcoming",
    key: "upcoming",
  },
  past: {
    text: "All Past",
    key: "past",
  },
});

function AppointmentCard({ info }) {
  return (
    <div className="mentee-appt-card">
      <div className="status-section">
        {info.status} <div className={`status-${info.status}`} />
      </div>
      <div className="mentee-appt-card-header">
        Meeting with <a href={PROFILE_URL + info.mentorId}>{info.mentorName}</a>
      </div>
      <div className="mentee-appt-card-time">
        {info.date}
        <br />
        {info.time}
      </div>
      <div className="mentee-appt-card-topic">
        <MenuOutlined /> {info.topic}
      </div>
    </div>
  );
}

function MenteeAppointments() {
  const [appointments, setAppointments] = useState({});
  const [visibleAppts, setVisibleAppts] = useState([]);
  const [favMentors, setFavMentors] = useState([]);
  const { profileId } = useAuth();

  useEffect(() => {
    async function getData() {
      const appointmentsResponse = await fetchAppointmentsByMenteeId(profileId);
      const resFavMentors = await getFavMentorsById(profileId);

      const formattedAppointments = formatAppointments(
        appointmentsResponse,
        ACCOUNT_TYPE.MENTEE
      );
      if (formattedAppointments && favMentors) {
        // TODO: Connect this to the backend once #289 is ready
        setAppointments(ApptData);
        setVisibleAppts(ApptData.upcoming);

        resFavMentors.map((elem) => (elem.id = elem._id.$oid));
        setFavMentors(resFavMentors);
      } else {
        console.error("Failed to fetch appointments or favorite mentors");
      }
    }
    getData();
  }, [profileId]);

  const handleOverlayChange = (newSelect) => {
    setVisibleAppts(appointments[newSelect]);
  };

  const handleUnfavorite = async (mentorId, name) => {
    const res = await EditFavMentorById(profileId, mentorId, false);
    if (!res) {
      message.error(`Failed to unfavorite mentor ${name}`, 3);
    } else {
      message.success(`Successfully unfavorite mentor ${name}`, 3);
      const newFav = favMentors.filter((mentor) => mentor.id != mentorId);
      setFavMentors(newFav);
    }
  };

  return (
    <div className="mentee-appointments-page">
      <div className="mentee-appts-section">
        <div className="mentee-appts-header">Welcome {ApptData.name}!</div>
        <div className="mentee-appts-container">
          <OverlaySelect
            options={appointmentTabs}
            defaultValue={appointmentTabs.upcoming}
            className="mentee-appts-overlay-style"
            onChange={handleOverlayChange}
          />
          {visibleAppts.map((elem) => (
            <AppointmentCard info={elem} />
          ))}
        </div>
      </div>
      <BookmarkSidebar bookmarks={favMentors} unfavorite={handleUnfavorite} />
    </div>
  );
}

export default MenteeAppointments;
