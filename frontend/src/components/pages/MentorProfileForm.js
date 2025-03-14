import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Upload,
  Avatar,
  Form,
  Input,
  Select,
  Divider,
  Typography,
  Radio,
} from "antd";
import { useSelector } from "react-redux";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  ACCOUNT_TYPE,
  MENTEE_DEFAULT_VIDEO_NAME,
  TIMEZONE_OPTIONS,
} from "utils/consts";

import { urlRegex } from "utils/misc";
import moment from "moment";
import ImgCrop from "antd-img-crop";
import { UserOutlined, EditFilled } from "@ant-design/icons";
import { css } from "@emotion/css";
import { fetchPartners } from "utils/api";

const styles = {
  formGroup: css`
    display: flex;
    flex-direction: row;
    gap: 1em;
    width: 100%;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 0;
    }
  `,
  formGroupItem: css`
    flex: 1;
  `,
};

function MentorProfileForm({
  newProfile,
  email,
  onSubmit,
  loading,
  profileData,
  resetFields,
  applicationData,
  n50_flag,
}) {
  const { t, i18n } = useTranslation();
  const options = useSelector((state) => state.options);
  const [image, setImage] = useState(null);
  const [changedImage, setChangedImage] = useState(false);
  const [edited, setEdited] = useState(false);
  const [form] = Form.useForm();
  const [partnerOptions, setPartnerOptions] = useState([]);
  const [flag, setFlag] = useState(false);
  const [finishFlag, setFinishFlag] = useState(false);
  var n50_user = localStorage.getItem("n50_user");

  useEffect(() => {
    async function getPartners() {
      const partenr_data = await fetchPartners(undefined, null);
      if (!(partnerOptions.length > 0)) {
        partenr_data.map((item) => {
          partnerOptions.push({
            value: item._id.$oid,
            label: item.organization,
          });
          return true;
        });
        partnerOptions.push({
          value: null,
          label: t("commonApplication.no-affiliation"),
        });
        setPartnerOptions(partnerOptions);
        setFlag(!flag);
      }
    }

    getPartners();
  }, []);

  useEffect(() => {
    if (profileData) {
      form.setFieldsValue(profileData);
      form.setFieldValue("video", profileData.video?.url);
      setImage(profileData.image);

      if (profileData.organization == 0) {
        form.setFieldValue("organization", null);
      }
    }
    if (applicationData) {
      if (applicationData.specializations) {
        form.setFieldValue("specializations", applicationData.specializations);
      }
      form.setFieldValue(
        "organization",
        applicationData.partner ? applicationData.partner : null
      );
    }
  }, [profileData, form, resetFields, applicationData]);

  const educationSubForm = () => (
    <Form.List
      name="education"
      initialValue={[
        {
          school: "",
          graduation_year: "",
          majors: undefined,
          education_level: "",
        },
      ]}
    >
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => (
            <div
              key={key}
              className={css`
                margin-bottom: 2em;
              `}
            >
              <div className={styles.formGroup}>
                <Form.Item
                  className={styles.formGroupItem}
                  {...restField}
                  label={t("commonProfile.school")}
                  name={[name, "school"]}
                  rules={[
                    {
                      required: true,
                      message: t("common.requiredSchool"),
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  className={styles.formGroupItem}
                  {...restField}
                  name={[name, "graduation_year"]}
                  label={t("commonProfile.graduationYear")}
                  rules={[
                    {
                      required: true,
                      message: t("common.requiredGraduationYear"),
                    },
                  ]}
                >
                  <Input type="number" />
                </Form.Item>
              </div>
              <div className={styles.formGroup}>
                <Form.Item
                  {...restField}
                  className={styles.formGroupItem}
                  name={[name, "majors"]}
                  label={t("commonProfile.majors")}
                  rules={[
                    {
                      required: true,
                      message: t("common.requiredMajors"),
                    },
                  ]}
                >
                  <Select
                    placeholder={t("commonProfile.majorsExamples")}
                    mode="tags"
                    allowClear
                    tokenSeparators={[","]}
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, "education_level"]}
                  className={styles.formGroupItem}
                  label={t("commonProfile.degree")}
                  rules={[
                    {
                      required: true,
                      message: t("common.requiredDegree"),
                    },
                  ]}
                >
                  <Input placeholder={t("commonProfile.degreeExample")} />
                </Form.Item>
              </div>
              {key !== 0 && (
                <DeleteOutlined
                  onClick={() => remove(name)}
                  className={css`
                    float: right;
                    color: #ff4d4f;
                  `}
                />
              )}
              <Divider />
            </div>
          ))}
          <Form.Item>
            <Button
              type="dashed"
              onClick={() => add()}
              block
              icon={<PlusOutlined />}
            >
              {t("commonProfile.addMoreEducation")}
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>
  );

  const onFinish = async (values) => {
    setFinishFlag(true);
    let newData = values;
    newData.email = email;
    newData.role = ACCOUNT_TYPE.MENTOR;
    newData.video =
      values.video && values.video !== ""
        ? {
            title: MENTEE_DEFAULT_VIDEO_NAME,
            url: values.video,
            tag: MENTEE_DEFAULT_VIDEO_NAME,
            date_uploaded: moment().format(),
          }
        : null;
    newData.preferred_language = i18n.language;
    newData.image = image;
    newData.changedImage = changedImage;
    newData.edited = edited;
    onSubmit(newData);
  };

  return (
    <Form
      form={form}
      onFinish={onFinish}
      layout="vertical"
      style={{ width: "100%", marginTop: "1em" }}
      onValuesChange={() => setEdited(true)}
    >
      <Form.Item>
        <ImgCrop rotate aspect={1} minZoom={0.2}>
          <Upload
            onChange={async (file) => {
              setImage(file.file.originFileObj);
              setChangedImage(true);
              setEdited(true);
            }}
            accept=".png,.jpg,.jpeg"
            showUploadList={false}
          >
            <Avatar
              size={120}
              icon={<UserOutlined />}
              src={
                changedImage
                  ? image && URL.createObjectURL(image)
                  : image && image.url
              }
            />
            <Button
              shape="circle"
              icon={<EditFilled />}
              className={css`
                position: absolute;
                top: 0;
                left: 0;
              `}
            />
          </Upload>
        </ImgCrop>
        {!image && finishFlag && (
          <div
            class="ant-form-item-explain ant-form-item-explain-connected css-dev-only-do-not-override-1klw9xr"
            role="alert"
          >
            <div class="ant-form-item-explain-error">
              {t("common.requiredAvatar")}
            </div>
          </div>
        )}
      </Form.Item>
      <div className={styles.formGroup}>
        <Form.Item
          label={t("commonProfile.fullName")}
          name="name"
          className={styles.formGroupItem}
          rules={[
            {
              required: true,
              message: t("common.requiredFullName"),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t("mentorProfile.professionalTitle")}
          name="professional_title"
          rules={[
            {
              required: true,
              message: t("common.requiredProfessionalTitle"),
            },
          ]}
          className={styles.formGroupItem}
        >
          <Input />
        </Form.Item>
      </div>
      {newProfile ? (
        <div className={styles.formGroup}>
          <Form.Item
            label={t("common.password")}
            name="password"
            hasFeedback
            rules={[
              {
                required: true,
                message: t("common.requiredPassword"),
              },
            ]}
            className={styles.formGroupItem}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label={t("commonProfile.confirmPassword")}
            name="confirmPassword"
            dependencies={["password"]}
            hasFeedback
            required
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(t("commonProfile.passwordMismatch"))
                  );
                },
              }),
            ]}
            className={styles.formGroupItem}
          >
            <Input.Password />
          </Form.Item>
        </div>
      ) : null}
      <Form.Item required label={t("commonProfile.biography")} name="biography">
        <Input.TextArea rows={3} />
      </Form.Item>
      <div className={styles.formGroup}>
        <Form.Item
          label={t("mentorProfile.availableInPerson")}
          name="offers_in_person"
          rules={[
            {
              required: true,
              message: t("common.requiredAvailableInPerson"),
            },
          ]}
          className={styles.formGroupItem}
          valuePropName="checked"
        >
          <Radio.Group>
            <Radio value={true}>{t("common.yes")}</Radio>
            <Radio value={false}>{t("common.no")}</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label={t("mentorProfile.availableGroupAppointments")}
          name="offers_group_appointments"
          rules={[
            {
              required: true,
              message: t("common.requiredAvailableGroupAppointments"),
            },
          ]}
          className={styles.formGroupItem}
          valuePropName="checked"
        >
          <Radio.Group>
            <Radio value={true}>{t("common.yes")}</Radio>
            <Radio value={false}>{t("common.no")}</Radio>
          </Radio.Group>
        </Form.Item>
      </div>
      <div className={styles.formGroup}>
        <Form.Item
          label={t("commonProfile.location")}
          name="location"
          className={styles.formGroupItem}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t("commonProfile.website")}
          name="website"
          rules={[
            {
              pattern: new RegExp(urlRegex),
              message: t("common.invalidUrl"),
            },
          ]}
          className={styles.formGroupItem}
        >
          <Input addonBefore="URL" />
        </Form.Item>
      </div>
      <div className={styles.formGroup}>
        <Form.Item
          label={t("commonProfile.languages")}
          name="languages"
          rules={[
            {
              required: true,
              message: t("common.requiredLanguage"),
            },
          ]}
          className={styles.formGroupItem}
        >
          <Select
            options={options.languages}
            mode="multiple"
            placeholder={t("commonProfile.languagesExample")}
          />
        </Form.Item>
        <Form.Item
          label={t("commonProfile.linkedin")}
          name="linkedin"
          rules={[
            {
              pattern: new RegExp(urlRegex),
              message: t("common.invalidUrl"),
            },
          ]}
          className={styles.formGroupItem}
        >
          <Input addonBefore="URL" />
        </Form.Item>
      </div>
      <Form.Item
        label={t("mentorProfile.specializations")}
        name="specializations"
        rules={[
          {
            required: true,
            message: t("common.requiredSpecializations"),
          },
        ]}
      >
        <Select
          options={options.specializations}
          mode="tags"
          placeholder={t("common.pleaseSelect")}
          tokenSeparators={[","]}
        />
      </Form.Item>
      <Form.Item
        label={t("menteeProfile.organizationAffiliation")}
        name="organization"
        rules={[
          {
            required: false,
            message: t("common.requiredOrganizationAffiliation"),
          },
        ]}
        className={styles.formGroupItem}
      >
        <Select options={[...partnerOptions]} disabled={n50_flag || n50_user} />
      </Form.Item>
      <Form.Item
        label={t("common.timezone")}
        name="timezone"
        rules={[
          {
            required: true,
            message: t("common.requiredTimezone"),
          },
        ]}
        className={styles.formGroupItem}
      >
        <Select options={[...TIMEZONE_OPTIONS]} />
      </Form.Item>
      <Typography.Title level={4}>
        {t("commonProfile.education")}
      </Typography.Title>
      {educationSubForm()}
      <Typography.Title level={4}>
        {t("commonProfile.addVideos")}
      </Typography.Title>
      <Typography.Paragraph>
        {t("commonProfile.introductionVideo")}
      </Typography.Paragraph>
      <Form.Item
        label={t("commonProfile.pasteLink")}
        name="video"
        rules={[
          {
            pattern: new RegExp(urlRegex),
            message: t("common.invalidUrl"),
          },
        ]}
      >
        <Input addonBefore="URL" />
      </Form.Item>
      <Form.Item>
        <Button
          id="submit"
          type="primary"
          htmlType="submit"
          block
          loading={loading}
        >
          {t("common.save")}
        </Button>
      </Form.Item>
    </Form>
  );
}

export default MentorProfileForm;
