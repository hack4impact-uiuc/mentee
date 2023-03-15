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
import { getMenteeID } from "utils/auth.service";
import { fetchMenteeByID, editFavMentorById } from "../utils/api";
import { Rate, Tooltip } from "antd";
import MentorContactModal from "./MentorContactModal";
import PartnerProfileModal from "./PartnerProfileModal";

function ProfileContent(props) {
  const { accountType, account } = props;
  const { isMentor, isMentee, isPartner, profileId } = useAuth();
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
    if (accountType == ACCOUNT_TYPE.MENTOR && name) {
      return name;
    } else if (name && age) {
      return name + ", " + age;
    } else if (accountType == ACCOUNT_TYPE.PARTNER) {
      return account.organization;
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
    if (accountType == ACCOUNT_TYPE.MENTOR) {
      return (
        <div>
          <div className="mentor-profile-heading">
            <b>Specializations</b>
          </div>
          <div>{getSpecializationTags(props.mentor.specializations || [])}</div>
        </div>
      );
    } else if (accountType == ACCOUNT_TYPE.MENTEE) {
      return (
        <div>
          <div className="mentor-profile-heading">
            <b>Areas of interest</b>
          </div>
          <div>{getSpecializationTags(props.mentor.specializations || [])}</div>
        </div>
      );
    } else {
      return (
        <div>
          <div className="mentor-profile-heading">
            <b>Regions Work In</b>
          </div>
          <div>{getSpecializationTags(account?.regions || [])}</div>
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
          {isMentee && favoriteMentorIds.size && accountType == 1 ? (
            <div className="favorite-button-profile">
              <Rate
                character={<StarFilled />}
                count={1}
                defaultValue={favorite ? 1 : 0}
                onChange={(number) => onFavoriteClick(number)}
              />
            </div>
          ) : null}
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
                    mentorSpecializations={props.mentor?.specializations}
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
        {isPartner && props.showEditBtn ? (
          <div className="mentor-profile-button">
            <PartnerProfileModal
              mentor={account}
              onSave={props.handleSaveEdits}
            />
          </div>
        ) : (
          ""
        )}
      </div>
      <br />

      <div className="mentor-profile-tags-container">
        {props.mentor.location && (
          <span className="mentor-profile-tag">
            <EnvironmentOutlined className="mentor-profile-tag-icon" />
            <Tooltip title={props.mentor.location} placement="topLeft">
              {" "}
              {props.mentor.location}{" "}
            </Tooltip>
          </span>
        )}
        {props.mentor.languages && props.mentor.languages.length > 0 && (
          <span className="mentor-profile-tag">
            <CommentOutlined className="mentor-profile-tag-icon" />
            <Tooltip
              title={getLanguages(props.mentor.languages || [])}
              placement="topLeft"
            >
              {" "}
              {getLanguages(props.mentor.languages || [])}{" "}
            </Tooltip>
          </span>
        )}
        {props.mentor.website && (
          <span className="mentor-profile-tag">
            <LinkOutlined className="mentor-profile-tag-icon" />
            <Tooltip
              title={
                <a
                  href={formatLinkForHref(props.mentor.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {props.mentor.website}
                </a>
              }
              placement="topLeft"
            >
              <a
                href={formatLinkForHref(props.mentor.website)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {props.mentor.website}
              </a>
            </Tooltip>
          </span>
        )}
        {props.mentor.linkedin && (
          <span className="mentor-profile-tag">
            <LinkedinOutlined className="mentor-profile-tag-icon" />
            <Tooltip
              title={
                <a
                  href={formatLinkForHref(props.mentor.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {props.mentor.linkedin}
                </a>
              }
              placement="topLeft"
            >
              <a
                href={formatLinkForHref(props.mentor.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {props.mentor.linkedin}
              </a>
            </Tooltip>
          </span>
        )}
      </div>
      <br />
      {accountType == ACCOUNT_TYPE.PARTNER ? (
        <>
          {" "}
          <div className="mentor-profile-heading">
            <b>Brief Introduction to Your Org/Inst/Corp</b>
          </div>
          <div className="mentor-profile-about">{account.intro}</div>
        </>
      ) : (
        <>
          <div className="mentor-profile-heading">
            <b>Bio</b>
          </div>
          <div className="mentor-profile-about">{props.mentor.biography}</div>
        </>
      )}

      <br />
      {getSpecializations(props.mentor.specializations)}
      <br />
      {accountType != ACCOUNT_TYPE.PARTNER && (
        <>
          <div className="mentor-profile-heading">
            <b>Education</b>
          </div>
          <div>{getEducations(props.mentor.education)}</div>
        </>
      )}
      <br />
      {accountType == ACCOUNT_TYPE.PARTNER && (
        <>
          <div className="mentor-profile-heading">
            <b>Contact Person's Full Name</b>
          </div>
          <div className="mentor-profile-about">{account.person_name}</div>
          <br /> <br />
          <div className="mentor-profile-heading">
            <b>Current & Upcoming Project Topics </b>
          </div>
          <div className="mentor-profile-about">{account.topics}</div>
          <br /> <br />
          <div className="mentor-profile-heading">
            <b>Sustainable Development Goals Your Work Supports </b>
          </div>
          <div className="mentor-profile-about">{account.sdgs}</div>
          <br /> <br />
          <div className="mentor-profile-heading">
            <b>Open to Collaboration on Grants</b>
          </div>
          <div className="mentor-profile-about">
            {account.open_grants ? "Yes" : "No"}
          </div>
          <br /> <br />
          <div className="mentor-profile-heading">
            <b>Open to Collaboration on Projects</b>
          </div>
          <div className="mentor-profile-about">
            {account.open_projects ? "Yes" : "No"}
          </div>
        </>
      )}

      {props.mentor.video && (
        <div className="mentor-profile-heading">
          <div className="mentor-profile-heading">
            <b>Video</b>
          </div>
          <LinkOutlined className="mentor-profile-tag-icon" />
          <Tooltip
            title={
              <a
                href={formatLinkForHref(props.mentor.video.url)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {props.mentor.video.url}
              </a>
            }
            placement="topLeft"
          >
            <a
              href={formatLinkForHref(props.mentor.video.url)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {props.mentor.video.url}
            </a>
          </Tooltip>
        </div>
      )}
    </div>
  );
}

export default ProfileContent;
