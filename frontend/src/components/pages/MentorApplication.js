import React, { useState, useEffect } from "react";
import { Button, Form, Input, Radio, Typography, Select } from "antd";
import { useTranslation } from "react-i18next";
import { createApplication, fetchPartners } from "utils/api";
import { phoneRegex } from "utils/misc";
import { useSelector } from "react-redux";
import { N50_ID } from "utils/consts";
const { Paragraph } = Typography;

// constant declarations
const { TextArea } = Input;
function MentorApplication({
  email,
  role,
  n50_flag,
  onSubmitFailure,
  onSubmitSuccess,
}) {
  const { t } = useTranslation();
  const [loading, setloading] = useState(false);
  const options = useSelector((state) => state.options);
  const [partnerOptions, setPartnerOptions] = useState([]);

  useEffect(() => {
    async function getPartners() {
      const partenr_data = await fetchPartners(undefined, null);
      var temp_partner_options = [];
      partenr_data.map((item) => {
        if (n50_flag) {
          if (item._id.$oid === N50_ID) {
            temp_partner_options.push({
              value: item._id.$oid,
              label: item.organization,
            });
          }
        } else {
          temp_partner_options.push({
            value: item._id.$oid,
            label: item.organization,
          });
        }
        return true;
      });
      if (!n50_flag) {
        temp_partner_options.push({
          value: null,
          label: t("commonApplication.no-affiliation"),
        });
      }
      setPartnerOptions(temp_partner_options);
      setloading(false);
    }
    getPartners();
  }, []);

  const onFinish = async (values) => {
    if (n50_flag) {
      values.partner = N50_ID;
    }
    setloading(true);
    const data = {
      email,
      name: `${values.firstName} ${values.lastName}`,
      cell_number: values.phoneNumber,
      hear_about_us: values.hearAboutUs,
      employer_name: values.employerName,
      companyTime: values.jobDuration,
      role_description: values.jobDescription,
      immigrant_status: values.immigrationStatus,
      languages: values.languageBackground,
      specialistTime: values.commitDuration,
      referral: values.referral,
      knowledge_location: values.knowledgeLocation,
      isColorPerson: values.isPersonOfColor,
      isMarginalized: values.isMarginalized,
      isFamilyNative: values.communityStatus,
      isEconomically: values.economicBackground,
      identify: values.genderIdentification,
      pastLiveLocation: values.previousLocations,
      date_submitted: new Date(),
      specializations: values.specializations,
      organization: values.organization,
      partner: values.partner,
      role,
    };
    const res = await createApplication(data);
    setloading(false);
    if (res) {
      onSubmitSuccess();
    } else {
      onSubmitFailure();
    }
  };

  return (
    <div>
      <Form onFinish={onFinish} layout="vertical" style={{ width: "100%" }}>
        <Form.Item>
          <Typography>
            <Paragraph id="mentorIntroduction">
              {" "}
              {t("mentorApplication.introduction")}
            </Paragraph>
            <Paragraph id="mentorfilloutprompt">
              {" "}
              {t("mentorApplication.filloutPrompt")}
            </Paragraph>
          </Typography>
        </Form.Item>
        <Form.Item
          label={t("common.firstName")}
          name="firstName"
          rules={[
            {
              required: true,
              message: t("common.requiredFirstName"),
            },
          ]}
        >
          <Input placeholder={t("common.firstName")} />
        </Form.Item>
        <Form.Item
          label={t("common.lastName")}
          name="lastName"
          rules={[
            {
              required: true,
              message: t("common.requiredLasttName"),
            },
          ]}
        >
          <Input placeholder={t("common.lastName")} />
        </Form.Item>
        <Form.Item
          label={t("common.phoneNumber")}
          name="phoneNumber"
          required
          rules={[
            {
              pattern: new RegExp(phoneRegex),
              message: t("profile.validatePhone"),
            },
          ]}
        >
          <Input type="tel" placeholder={t("common.phoneNumber")} />
        </Form.Item>
        <Form.Item
          label={t("mentorApplication.hearAboutUs")}
          name="hearAboutUs"
          rules={[
            {
              required: true,
              message: t("common.requiredHearAboutUs"),
            },
          ]}
        >
          <Input placeholder={t("mentorApplication.hearAboutUs")} />
        </Form.Item>
        <Form.Item
          label={t("mentorApplication.knowledgeLocation")}
          name="knowledgeLocation"
          rules={[
            {
              required: true,
              message: t("common.requiredKnowledgeLocation"),
            },
          ]}
        >
          <TextArea
            rows={3}
            placeholder={t("mentorApplication.knowledgeLocation")}
          />
        </Form.Item>
        <Form.Item
          label={t("mentorApplication.previousLocations")}
          name="previousLocations"
          rules={[
            {
              required: true,
              message: t("common.requiredPreviousLocations"),
            },
          ]}
        >
          <TextArea
            rows={3}
            placeholder={t("mentorApplication.previousLocations")}
          />
        </Form.Item>
        <Form.Item
          label={t("mentorApplication.employerName")}
          name="employerName"
          rules={[
            {
              required: true,
              message: t("common.requiredEmployerName"),
            },
          ]}
        >
          <Input placeholder={t("mentorApplication.employerName")} />
        </Form.Item>
        <Form.Item
          label={t("mentorApplication.jobDescription")}
          name="jobDescription"
          rules={[
            {
              required: true,
              message: t("common.requiredJobDescription"),
            },
          ]}
        >
          <Input placeholder={t("mentorApplication.jobDescription")} />
        </Form.Item>
        <Form.Item
          label={t("mentorApplication.jobDuration")}
          name="jobDuration"
          rules={[
            {
              required: true,
              message: t("common.requiredJobDuration"),
            },
          ]}
        >
          <Select
            options={[
              {
                value: "Less than one year",
                label: t("mentorApplication.duration1"),
              },
              {
                value: "1-4 years",
                label: t("mentorApplication.duration2"),
              },
              {
                value: "5-10 years",
                label: t("mentorApplication.duration3"),
              },
              {
                value: "10-20 years",
                label: t("mentorApplication.duration4"),
              },
              {
                value: "21+ Years",
                label: t("mentorApplication.duration5"),
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          label={t("mentorApplication.commitDuration")}
          name="commitDuration"
          rules={[
            {
              required: true,
              message: t("common.requiredCommitDuration"),
            },
          ]}
        >
          <Select
            options={[
              {
                value: "One year with us",
                label: t("mentorApplication.commitDuration1"),
              },
              {
                value: "Two years with us",
                label: t("mentorApplication.commitDuration2"),
              },
              {
                value: "For as long as you'll have me!",
                label: t("mentorApplication.commitDuration3"),
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          label={t("mentorApplication.immigrationStatus")}
          name="immigrationStatus"
          rules={[
            {
              required: true,
              message: t("common.requiredImmigrationStatus"),
            },
          ]}
        >
          <Radio.Group>
            <Radio value={true}>{t("common.yes")}</Radio>
            <Radio value={false}>{t("common.no")}</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label={t("mentorApplication.communityStatus")}
          name="communityStatus"
          rules={[
            {
              required: true,
              message: t("common.requiredCommunityStatus"),
            },
          ]}
        >
          <Radio.Group>
            <Radio value={true}>{t("common.yes")}</Radio>
            <Radio value={false}>{t("common.no")}</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label={t("mentorApplication.economicBackground")}
          name="economicBackground"
          rules={[
            {
              required: true,
              message: t("common.requiredEconomicBackground"),
            },
          ]}
        >
          <Radio.Group>
            <Radio value={true}>{t("common.yes")}</Radio>
            <Radio value={false}>{t("common.no")}</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label={t("mentorApplication.isPersonOfColor")}
          name="isPersonOfColor"
          rules={[
            {
              required: true,
              message: t("common.requiredIsPersonOfColor"),
            },
          ]}
        >
          <Radio.Group>
            <Radio value={true}>{t("common.yes")}</Radio>
            <Radio value={false}>{t("common.no")}</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label={t("commonApplication.genderIdentification")}
          name="genderIdentification"
          rules={[
            {
              required: true,
              message: t("common.requiredGenderIdentification"),
            },
          ]}
        >
          <Select
            options={[
              {
                label: t("commonApplication.man"),
                value: "man",
              },
              {
                label: t("commonApplication.woman"),
                value: "woman",
              },
              {
                label: t("commonApplication.lgbtq"),
                value: "LGTBQ+",
              },
              {
                label: t("commonApplication.other"),
                value: "other",
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          label={t("mentorApplication.isMarginalized")}
          name="isMarginalized"
          rules={[
            {
              required: true,
              message: t("common.requiredIsMarginalized"),
            },
          ]}
        >
          <Radio.Group>
            <Radio value={true}>{t("common.yes")}</Radio>
            <Radio value={false}>{t("common.no")}</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label={t("mentorApplication.languageBackground")}
          name="languageBackground"
          rules={[
            {
              required: true,
              message: t("common.requiredLanguage"),
            },
          ]}
        >
          <Input placeholder={t("mentorApplication.languageBackground")} />
        </Form.Item>
        <Form.Item
          label={t("mentorApplication.referral")}
          name="referral"
          rules={[
            {
              required: true,
              message: t("common.requiredReferral"),
            },
          ]}
        >
          <Input placeholder={t("mentorApplication.referral")} />
        </Form.Item>
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
          label={t("commonApplication.partner")}
          name="partner"
          rules={[
            {
              required: false,
              message: t("common.requiredPartner"),
            },
          ]}
        >
          <Select
            showSearch
            filterOption={(input, option) =>
              (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
            }
            defaultValue={n50_flag ? N50_ID : null}
            disabled={n50_flag}
            options={[...partnerOptions]}
          />
        </Form.Item>
        <Form.Item>
          <Button
            id="submit"
            type="primary"
            htmlType="submit"
            block
            loading={loading}
          >
            {t("common.submit")}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
export default MentorApplication;
