import React, { useEffect, useState } from "react";
import {
  EnvironmentOutlined,
  CommentOutlined,
  LinkOutlined,
  LinkedinOutlined,
  LockFilled,
  StarFilled,
} from "@ant-design/icons";
import { formatLinkForHref } from "utils/misc";
import MentorProfileModal from "./MentorProfileModal";
import MenteeProfileModal from "./MenteeProfileModal";
import MenteeAppointmentModal from "./MenteeAppointmentModal";
import PublicMessageModal from "./PublicMessageModal";
import { ACCOUNT_TYPE } from "utils/consts";
import useAuth from "utils/hooks/useAuth";
import "./css/Profile.scss";
import MentorContactModal from "./MentorContactModal";
import { getMenteeID } from "utils/auth.service";
import { fetchMenteeByID, editFavMentorById } from "../utils/api";
import { Rate } from "antd";

function ProfileContent(props) {
  const { accountType } = props;
  const { isMentor, isMentee, profileId } = useAuth();
  const [mentee, setMentee] = useState();
  const [favorite, setFavorite] = useState(false);

  const [favoriteMentorIds, setFavoriteMentorIds] = useState(new Set());

  useEffect(() => {
    async function getMentee() {
      const mentee_id = await getMenteeID();
      const mentee_data = await fetchMenteeByID(mentee_id);
      if (mentee_data) {
        setMentee(mentee_data);
      }
    }
    if (isMentee) {
      getMentee();
    }
  }, [isMentee]);

  useEffect(() => {
    function initializeFavorites() {
      let fav_set = new Set();
      mentee.favorite_mentors_ids.forEach((id) => {
        fav_set.add(id);
      });
      setFavoriteMentorIds(fav_set);
      setFavorite(fav_set.has(props.id));
    }
    if (isMentee) {
      initializeFavorites();
    }
  }, [mentee]);

  function onEditFav(mentor_id, favorite) {
    editFavMentorById(profileId, mentor_id, favorite);
  }

  function onFavoriteClick(fav) {
    setFavorite(!fav);
    onEditFav(props.id, fav);
  }

  const getTitle = (name, age) => {
    if (parseInt(accountType, 10) === ACCOUNT_TYPE.MENTOR && name) {
      return name;
    } else if (name && age) {
      return name + ", " + age;
    }
  };

  const getPrivacy = (privacy) => {
    if (privacy) {
      return <LockFilled className="mentor-lock-symbol" />;
    }
  };
  const getLanguages = (languages) => {
    return languages.join(" • ");
  };

  const getSpecializationTags = (specializations) => {
    return specializations.map((specialization, idx) => (
      <div className="mentor-specialization-tag">{specialization}</div>
    ));
  };

  const getSpecializations = (isMentor) => {
    if (isMentor) {
      return (
        <div>
          <div className="mentor-profile-heading">
            <b>Specializations</b>
          </div>
          <div>{getSpecializationTags(props.mentor.specializations || [])}</div>
        </div>
      );
    }
  };

  const getEducations = (educations) => {
    if (!educations || !educations[0]) {
      return;
    }
    return educations.map((education) => (
      <>
        {education.majors.map((major) => (
          <div className="mentor-profile-education">
            <b>{education.school}</b>
            <br />
            {education.education_level}, {major}
            <br />
            <t className="mentor-profile-heading">
              {education.graduation_year}
            </t>
          </div>
        ))}
      </>
    ));
  };

  return (
    <div>
      <div className="mentor-profile-name">
        <div className="mentor-profile-decorations">
          {getTitle(props.mentor.name, props.mentor.age)}
          <div>{getPrivacy(props.mentor.is_private)}</div>
          {isMentee && favoriteMentorIds.size && accountType == 1 && (
            <div className="favorite-button-profile">
              <Rate
                character={<StarFilled />}
                count={1}
                defaultValue={favorite ? 1 : 0}
                onChange={(number) => onFavoriteClick(number)}
              />
            </div>
          )}
        </div>

        <div className="mentor-profile-actions">
          <div className="mentor-profile-book-appt-btn">
            {isMentee &&
              (props.isMentor ||
                parseInt(accountType, 10) === ACCOUNT_TYPE.MENTOR) && (
                <>
                  <MentorContactModal
                    mentorName={props.mentor?.name}
                    mentorId={props.mentor?._id?.$oid}
                    menteeId={profileId}
                  />
                  <MenteeAppointmentModal
                    mentor_name={props.mentor.name}
                    availability={props.mentor.availability}
                    mentor_id={
                      props.mentor &&
                      props.mentor._id &&
                      props.mentor._id["$oid"]
                    }
                    mentee_id={profileId}
                    handleUpdateMentor={props.handleUpdateAccount}
                  />
                </>
              )}
          </div>
          <div className="mentor-profile-send-msg-btn">
            {!props.isMentor &&
              parseInt(accountType, 10) !== ACCOUNT_TYPE.MENTOR &&
              props.mentor &&
              props.mentor._id &&
              props.mentor._id["$oid"] !== profileId &&
              profileId && (
                <PublicMessageModal
                  menteeName={props.mentor.name}
                  menteeID={
                    props.mentor && props.mentor._id && props.mentor._id["$oid"]
                  }
                  mentorID={profileId}
                />
              )}
          </div>
        </div>
        {isMentor && props.showEditBtn ? (
          <div className="mentor-profile-button">
            <MentorProfileModal
              mentor={props.mentor}
              onSave={props.handleSaveEdits}
            />
          </div>
        ) : (
          isMentee &&
          props.showEditBtn && (
            <div className="mentor-profile-button">
              <MenteeProfileModal
                mentee={props.mentor}
                onSave={props.handleSaveEdits}
              />
            </div>
          )
        )}
      </div>
      <div>
        {props.mentor.location && (
          <span>
            <EnvironmentOutlined className="mentor-profile-tag-first" />
            {props.mentor.location}
          </span>
        )}
        {props.mentor.languages && props.mentor.languages.length > 0 && (
          <span>
            <CommentOutlined
              className={
                !props.mentor.location
                  ? "mentor-profile-tag-first"
                  : "mentor-profile-tag"
              }
            />
            {getLanguages(props.mentor.languages || [])}
          </span>
        )}
        {props.mentor.website && (
          <span>
            <LinkOutlined className="mentor-profile-tag" />
            <a
              href={formatLinkForHref(props.mentor.website)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {props.mentor.website}
            </a>
          </span>
        )}
        {props.mentor.linkedin && (
          <span>
            <LinkedinOutlined className="mentor-profile-tag" />
            <a
              href={formatLinkForHref(props.mentor.linkedin)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {props.mentor.linkedin}
            </a>
          </span>
        )}
      </div>
      <br />
      <div className="mentor-profile-heading">
        <b>About</b>
      </div>
      <div className="mentor-profile-about">{props.mentor.biography}</div>
      <br />
      {getSpecializations(props.isMentor)}
      <br />
      <div className="mentor-profile-heading">
        <b>Education</b>
      </div>
      <div>{getEducations(props.mentor.education)}</div>
    </div>
  );
}

export default ProfileContent;
