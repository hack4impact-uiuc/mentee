import React, { useState, useEffect } from "react";
import { Button, Modal, Checkbox, Avatar, Upload } from "antd";
import ModalInput from "./ModalInput";
import MenteeButton from "./MenteeButton";
import { UserOutlined, EditFilled, PlusCircleFilled } from "@ant-design/icons";
import { LANGUAGES, SPECIALIZATIONS } from "../utils/consts";
import { editMentorProfile, uploadMentorImage } from "../utils/api";
import "./css/AntDesign.scss";
import "./css/Modal.scss";

function MentorProfileModal(props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [numInputs, setNumInputs] = useState(14);
  const [inputClicked, setInputClicked] = useState(
    new Array(numInputs).fill(false)
  ); // each index represents an input box, respectively
  const [name, setName] = useState(null);
  const [title, setTitle] = useState(null);
  const [about, setAbout] = useState(null);
  const [inPersonAvailable, setInPersonAvailable] = useState(null);
  const [groupAvailable, setGroupAvailable] = useState(null);
  const [location, setLocation] = useState(null);
  const [website, setWebsite] = useState(null);
  const [languages, setLanguages] = useState(null);
  const [linkedin, setLinkedin] = useState(null);
  const [specializations, setSpecializations] = useState(null);
  const [educations, setEducations] = useState([]);
  const [image, setImage] = useState(null);
  const [changedImage, setChangedImage] = useState(false);
  const [edited, setEdited] = useState(false);

  useEffect(() => {
    setName(props.mentor.name);
    setTitle(props.mentor.professional_title);
    setAbout(props.mentor.biography);
    setInPersonAvailable(props.mentor.offers_in_person);
    setGroupAvailable(props.mentor.offers_group_appointments);
    setLocation(props.mentor.location);
    setWebsite(props.mentor.website);
    setLanguages(props.mentor.languages);
    setLinkedin(props.mentor.linkedin);
    setSpecializations(props.mentor.specializations);
    setEducations(props.mentor.education);
    setImage(props.mentor.image);
  }, [props.mentor]);

  function renderEducationInputs() {
    return (
      educations &&
      educations.map((education, i) => (
        <div className="modal-education-container">
          <div className="modal-education-sidebar"></div>
          <div className="modal-inner-education-container">
            <div className="modal-input-container">
              <ModalInput
                height={65}
                type="text"
                title="School"
                clicked={inputClicked[10 + i * 4]} // Each education degree has four inputs, i.e. i * 4
                index={10 + i * 4}
                handleClick={handleClick}
                onEducationChange={handleSchoolChange}
                educationIndex={i}
                defaultValue={education.school}
              ></ModalInput>
              <ModalInput
                height={65}
                type="text"
                title="End Year/Expected"
                clicked={inputClicked[10 + i * 4 + 1]}
                index={10 + i * 4 + 1}
                handleClick={handleClick}
                onEducationChange={handleGraduationDateChange}
                educationIndex={i}
                defaultValue={education.graduation_year}
              ></ModalInput>
            </div>
            <div className="modal-input-container">
              <ModalInput
                height={65}
                type="dropdown"
                title="Major(s)"
                clicked={inputClicked[10 + i * 4 + 2]}
                index={10 + i * 4 + 2}
                handleClick={handleClick}
                onEducationChange={handleMajorsChange}
                educationIndex={i}
                options={[]}
                placeholder="Ex. Computer Science, Biology"
                defaultValue={education.majors}
              ></ModalInput>
              <ModalInput
                height={65}
                type="text"
                title="Degree"
                clicked={inputClicked[10 + i * 4 + 3]}
                index={10 + i * 4 + 3}
                handleClick={handleClick}
                educationIndex={i}
                onEducationChange={handleDegreeChange}
                placeholder="Ex. Bachelor's"
                defaultValue={education.education_level}
              ></ModalInput>
            </div>
          </div>
        </div>
      ))
    );
  }

  function handleClick(index) {
    // Sets only the clicked input box to true to change color, else false
    let newClickedInput = new Array(numInputs).fill(false);
    newClickedInput[index] = true;
    setInputClicked(newClickedInput);
  }

  function handleNameChange(e) {
    setName(e.target.value);
    setEdited(true);
  }

  function handleTitleChange(e) {
    setTitle(e.target.value);
    setEdited(true);
  }

  function handleAboutChange(e) {
    setAbout(e.target.value);
    setEdited(true);
  }

  function handleInPersonAvailableChange(e) {
    setInPersonAvailable(e.target.checked);
    setEdited(true);
  }

  function handleGroupAvailableChange(e) {
    setGroupAvailable(e.target.checked);
    setEdited(true);
  }

  function handleLocationChange(e) {
    setLocation(e.target.value);
    setEdited(true);
  }

  function handleWebsiteChange(e) {
    setWebsite(e.target.value);
    setEdited(true);
  }

  function handleLanguageChange(e) {
    let languagesSelected = [];
    e.forEach((value) => languagesSelected.push(LANGUAGES[value]));
    setLanguages(languagesSelected);
    setEdited(true);
  }

  function handleLinkedinChange(e) {
    setLinkedin(e.target.value);
    setEdited(true);
  }

  function handleSpecializationsChange(e) {
    let specializationsSelected = [];
    e.forEach((value) => specializationsSelected.push(SPECIALIZATIONS[value]));
    setSpecializations(specializationsSelected);
    setEdited(true);
  }

  function handleSchoolChange(e, index) {
    const newEducations = [...educations];
    let education = newEducations[index];
    education.school = e.target.value;
    newEducations[index] = education;
    setEducations(newEducations);
    setEdited(true);
  }

  function handleGraduationDateChange(e, index) {
    const newEducations = [...educations];
    let education = newEducations[index];
    education.graduation_year = e.target.value;
    newEducations[index] = education;
    setEducations(newEducations);
    setEdited(true);
  }

  function handleMajorsChange(e, index) {
    const newEducations = [...educations];
    let education = newEducations[index];
    const majors = [];
    e.forEach((value) => majors.push(value));
    education.majors = majors;
    newEducations[index] = education;
    setEducations(newEducations);
    setEdited(true);
  }

  function handleDegreeChange(e, index) {
    const newEducations = [...educations];
    let education = newEducations[index];
    education.education_level = e.target.value;
    newEducations[index] = education;
    setEducations(newEducations);
    setEdited(true);
  }

  const handleAddEducation = () => {
    const newEducations = [...educations];
    newEducations.push({
      education_level: "",
      majors: [],
      school: "",
      graduation_year: "",
    });
    setEducations(newEducations);
    setEdited(true);
  };

  const handleSaveEdits = () => {
    async function saveEdits(data) {
      await editMentorProfile(data, props.mentor._id.$oid);
      if (changedImage) {
        await uploadMentorImage(image, props.mentor._id.$oid);
      }
      props.onSave();
      setModalVisible(false);
      setChangedImage(false);
    }
    if (!edited) {
      setModalVisible(false);
      return;
    }

    const updatedProfile = {
      name: name,
      professional_title: title,
      linkedin: linkedin,
      website: website,
      education: educations,
      languages: languages,
      specializations: specializations,
      biography: about,
      offers_in_person: inPersonAvailable,
      offers_group_appointments: groupAvailable,
    };

    saveEdits(updatedProfile);
  };

  return (
    <span>
      <span className="mentor-profile-button">
        <MenteeButton
          content={<b>Edit Profile</b>}
          onClick={() => setModalVisible(true)}
        />
      </span>
      <Modal
        title="Edit Profile"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        width="50%"
        style={{ overflow: "hidden" }}
        footer={
          <Button
            type="default"
            shape="round"
            style={styles.footer}
            onClick={handleSaveEdits}
          >
            Save
          </Button>
        }
      >
        <div className="modal-container">
          <div className="modal-profile-container">
            <Avatar
              size={120}
              icon={<UserOutlined />}
              className="modal-profile-icon"
              src={
                changedImage ? URL.createObjectURL(image) : image && image.url
              }
            />
            <Upload
              action={(file) => {
                setImage(file);
                setChangedImage(true);
              }}
              accept=".png,.jpg,.jpeg"
              showUploadList={false}
            >
              <Button
                shape="circle"
                icon={<EditFilled />}
                className="modal-profile-icon-edit"
              />
            </Upload>
          </div>
          <div className="modal-inner-container">
            <div className="modal-input-container">
              <ModalInput
                height={65}
                type="text"
                title="Name *"
                clicked={inputClicked[0]}
                index={0}
                handleClick={handleClick}
                onChange={handleNameChange}
                defaultValue={name}
              ></ModalInput>
              <ModalInput
                height={65}
                type="text"
                title="Professional Title *"
                clicked={inputClicked[1]}
                index={1}
                handleClick={handleClick}
                onChange={handleTitleChange}
                defaultValue={title}
              ></ModalInput>
            </div>
            <div className="modal-input-container">
              <ModalInput
                type="textarea"
                title="About"
                clicked={inputClicked[2]}
                index={2}
                handleClick={handleClick}
                onChange={handleAboutChange}
                defaultValue={about}
              ></ModalInput>
            </div>
            <div className="modal-availability-checkbox">
              <Checkbox
                className="modal-availability-checkbox-text"
                clicked={inputClicked[3]}
                index={3}
                handleClick={handleClick}
                onChange={handleInPersonAvailableChange}
                checked={inPersonAvailable}
              >
                Available online?
              </Checkbox>
              <div></div>
              <Checkbox
                className="modal-availability-checkbox-text"
                clicked={inputClicked[4]}
                index={4}
                handleClick={handleClick}
                onChange={handleGroupAvailableChange}
                checked={groupAvailable}
              >
                Available for group appointments?
              </Checkbox>
            </div>
            <div className="modal-input-container">
              <ModalInput
                height={65}
                type="text"
                title="Location"
                clicked={inputClicked[5]}
                index={5}
                handleClick={handleClick}
                onChange={handleLocationChange}
                defaultValue={location}
              ></ModalInput>
              <ModalInput
                height={65}
                type="text"
                title="Website"
                clicked={inputClicked[6]}
                index={6}
                handleClick={handleClick}
                onChange={handleWebsiteChange}
                defaultValue={website}
              ></ModalInput>
            </div>
            <div className="modal-input-container">
              <ModalInput
                height={65}
                type="dropdown"
                title="Languages"
                clicked={inputClicked[7]}
                index={7}
                handleClick={handleClick}
                onChange={handleLanguageChange}
                placeholder="Ex. English, Spanish"
                options={LANGUAGES}
                defaultValue={languages}
              ></ModalInput>
              <ModalInput
                height={65}
                type="text"
                title="LinkedIn"
                clicked={inputClicked[8]}
                index={8}
                handleClick={handleClick}
                onChange={handleLinkedinChange}
                defaultValue={linkedin}
              ></ModalInput>
            </div>
            <div className="modal-input-container">
              <ModalInput
                height={65}
                type="dropdown"
                title="Specializations"
                clicked={inputClicked[9]}
                index={9}
                handleClick={handleClick}
                onChange={handleSpecializationsChange}
                options={SPECIALIZATIONS}
                defaultValue={specializations}
              ></ModalInput>
            </div>
            <div className="modal-education-header">Education</div>
            {renderEducationInputs()}
            <div
              className="modal-input-container modal-education-add-container"
              onClick={handleAddEducation}
            >
              <PlusCircleFilled className="modal-education-add-icon" />
              <div className="modal-education-add-text">Add more</div>
            </div>
          </div>
        </div>
      </Modal>
    </span>
  );
}

const styles = {
  footer: {
    borderRadius: 13,
    marginRight: 15,
    backgroundColor: "#E4BB4F",
  },
};

export default MentorProfileModal;
