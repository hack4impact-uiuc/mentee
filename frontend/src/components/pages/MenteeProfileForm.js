import React, { useState } from "react";
import { withRouter, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Checkbox,
  Button,
  message,
  Upload,
  Avatar,
  Typography,
  Form,
  Input,
  Select,
  Divider,
} from "antd";
import { useSelector } from "react-redux";
import {
  checkStatusByEmail,
  createMenteeProfile,
  getApplicationStatus,
  uploadMenteeImage,
} from "utils/api";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  MENTEE_DEFAULT_VIDEO_NAME,
  NEW_APPLICATION_STATUS,
  getAgeRanges,
} from "utils/consts";
import moment from "moment";
import { sendVerificationEmail } from "utils/auth.service";
import ImgCrop from "antd-img-crop";
import { UserOutlined, EditFilled } from "@ant-design/icons";
import { css } from "@emotion/css";
import { phoneRegex, urlRegex } from "utils/misc";

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

function MenteeProfileForm({ email, role, newProfile }) {
  const history = useHistory();
  const { t, i18n } = useTranslation();
  const options = useSelector((state) => state.options);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState(null);
  const [changedImage, setChangedImage] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const educationSubForm = () => (
    <Form.List name="education">
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
                  required
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  className={styles.formGroupItem}
                  {...restField}
                  name={[name, "graduation_year"]}
                  label={t("commonProfile.graduationYear")}
                  required
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
                  required
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
                  required
                >
                  <Input placeholder={t("commonProfile.degreeExample")} />
                </Form.Item>
              </div>
              <DeleteOutlined
                onClick={() => remove(name)}
                className={css`
                  float: right;
                  color: #ff4d4f;
                `}
              />
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
    setSaving(true);

    let newProfile = values;
    newProfile.email = email;
    newProfile.role = role;
    newProfile.video =
      values.video !== undefined
        ? {
            title: MENTEE_DEFAULT_VIDEO_NAME,
            url: values.video,
            tag: MENTEE_DEFAULT_VIDEO_NAME,
            date_uploaded: moment().format(),
          }
        : null;
    console.log(values);

    const { inFirebase, isVerified } = await checkStatusByEmail(email, role);
    if (!inFirebase) {
      const state = await getApplicationStatus(email, role);
      if (state !== NEW_APPLICATION_STATUS.BUILDPROFILE && !isVerified) {
        messageApi.error(t("commonProfile.errorTrainingSteps"));
        return;
      }
    }

    newProfile.preferred_language = i18n.language;
    const res = await createMenteeProfile(newProfile, inFirebase);
    const menteeId = res?.data?.result?.mentorId;

    if (menteeId) {
      const verificationRes = await sendVerificationEmail(email);
      if (!verificationRes) {
        messageApi.error(t("verifyEmail.error"));
      }

      if (changedImage) {
        const uploadImageRes = await uploadMenteeImage(image, menteeId);

        if (!uploadImageRes) {
          messageApi.error(t("commonProfile.error.uploadImage"));
        }
      }
      setSaving(false);

      messageApi.info(t("commonProfile.accountCreated"));
      history.push({ pathname: "/login", state: { email, role } });
    } else {
      messageApi.error(t("commonProfile.error.save"));
      setSaving(false);
    }
  };

  return (
    <div>
      {contextHolder}
      <Typography.Title level={3}>
        {t("commonProfile.welcome")}
      </Typography.Title>
      <Form
        onFinish={onFinish}
        layout="vertical"
        style={{ width: "100%", marginTop: "1em" }}
      >
        <Form.Item>
          <ImgCrop rotate aspect={5 / 3}>
            <Upload
              onChange={async (file) => {
                setImage(file.file.originFileObj);
                setChangedImage(true);
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
        </Form.Item>
        <Form.Item label={t("commonProfile.fullName")} name="name" required>
          <Input />
        </Form.Item>
        {newProfile ? (
          <div className={styles.formGroup}>
            <Form.Item
              label={t("common.password")}
              name="password"
              hasFeedback
              required
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
        <Form.Item label={t("commonProfile.biography")} name="biography">
          <Input.TextArea rows={3} />
        </Form.Item>
        <div className={styles.formGroup}>
          <Form.Item
            label={t("commonProfile.location")}
            name="location"
            className={styles.formGroupItem}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t("menteeProfile.gender")}
            name="gender"
            required
            className={styles.formGroupItem}
          >
            <Input />
          </Form.Item>
        </div>
        <div className={styles.formGroup}>
          <Form.Item
            label={t("menteeProfile.age")}
            name="age"
            required
            className={styles.formGroupItem}
          >
            <Select options={getAgeRanges(t)} />
          </Form.Item>
          <Form.Item
            label={t("commonProfile.languages")}
            name="languages"
            required
            className={styles.formGroupItem}
          >
            <Select
              options={options.languages}
              mode="multiple"
              placeholder={t("commonProfile.languagesExample")}
            />
          </Form.Item>
        </div>
        <div className={styles.formGroup}>
          <Form.Item
            label={t("commonProfile.phone")}
            name="phone_number"
            rules={[
              {
                pattern: new RegExp(phoneRegex),
                message: t("profile.validatePhone"),
              },
            ]}
            className={styles.formGroupItem}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t("menteeProfile.organizationAffiliation")}
            name="organization"
            required
            className={styles.formGroupItem}
          >
            <Input />
          </Form.Item>
        </div>
        <Form.Item
          label={t("menteeProfile.areasOfInterest")}
          name="specializations"
        >
          <Select
            options={options.specializations}
            mode="multiple"
            placeholder={t("common.pleaseSelect")}
          />
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
        <Typography.Title level={4}>
          {t("menteeProfile.accountPrivacy")}
        </Typography.Title>
        <Typography.Paragraph>
          {t("menteeProfile.privateAccountInfo")}
        </Typography.Paragraph>
        <Form.Item name="is_private" valuePropName="checked">
          <Checkbox>{t("menteeProfile.privateAccount")}</Checkbox>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={saving}>
            {t("common.save")}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default withRouter(MenteeProfileForm);
