import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Form, Input, Radio, Typography, Select, Button } from "antd";
import { useTranslation } from "react-i18next";
import { createApplication, fetchPartners, getAllcountries } from "utils/api";
import "components/css/MentorApplicationPage.scss";

const { Paragraph } = Typography;
function MenteeApplication({ email, role, onSubmitSuccess, onSubmitFailure }) {
  const { t } = useTranslation();
  const options = useSelector((state) => state.options);
  const [loading, setLoading] = useState();
  const [partnerOptions, setPartnerOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  useEffect(() => {
    async function getPartners() {
      const partenr_data = await fetchPartners(undefined, null);
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
      setLoading(false);
    }
    async function getAllCountries() {
      const all_countires = await getAllcountries();
      var temp_countires = [];
      if (all_countires) {
        // Extract country names
        const countryNames = all_countires.map(
          (country) => country.name.common
        );
        // Sort country names in ascending order
        const sortedCountryNames = countryNames.sort();
        sortedCountryNames.map((country_name) => {
          temp_countires.push({
            label: country_name,
            value: country_name,
          });
        });
      }
      setCountryOptions(temp_countires);
    }
    getAllCountries();
    getPartners();
  }, []);

  // TODO: Clean this and MentorApplication.js up with the constants
  // constant declarations
  const immigrantOptions = [
    {
      value: "I am a refugee",
      label: t("menteeApplication.immigrantOption1"),
    },
    {
      value:
        "I am an immigrant (I am newly arrived or my parents are newly arrived in the country I am in)",
      label: t("menteeApplication.immigrantOption2"),
    },
    {
      value: "I am black.",
      label: t("menteeApplication.immigrantOption3"),
    },
    {
      value: "I am Hispanic/Latino.",
      label: t("menteeApplication.immigrantOption4"),
    },
    {
      value: "I am of native/ aboriginal/indigenous origins.",
      label: t("menteeApplication.immigrantOption5"),
    },
    {
      value: "I identify as LGTBQ.",
      label: t("menteeApplication.immigrantOption6"),
    },
    {
      value: "I have economic hardship.",
      label: t("menteeApplication.immigrantOption7"),
    },
    {
      value: "I come from a country at war.",
      label: t("menteeApplication.immigrantOption8"),
    },
    {
      value: "other",
      label: t("common.other"),
    },
  ];

  const workOptions = [
    {
      value: "I work part-time.",
      label: t("menteeApplication.workOption1"),
    },
    {
      value: "I work full-time.",
      label: t("menteeApplication.workOption2"),
    },
    {
      value: "I attend technical school.",
      label: t("menteeApplication.workOption3"),
    },
    {
      value: "I am a college/university student attaining my first degree.",
      label: t("menteeApplication.workOption4"),
    },
    {
      value:
        "I am a college/university students attaining my second or third degree.",
      label: t("menteeApplication.workOption5"),
    },
    {
      value: "other",
      label: t("common.other"),
    },
  ];

  const onFinish = async (values) => {
    setLoading(true);
    let immigrantStatus = values.immigrantStatus;
    let topics = values.topics;
    let workState = values.workstate;

    if (values.socialMedia === "other") {
      values.socialMedia = values.otherSocialMedia;
    }
    if (values.genderIdentification === "other") {
      values.genderIdentification = values.otherGenderIdentification;
    }
    if (values.language === "other") {
      values.language = values.otherLanguage;
    }

    if (values.immigrantStatus.includes("other")) {
      immigrantStatus = immigrantStatus.filter(function (value, index, arr) {
        return value !== "other";
      });
      immigrantStatus.push("Other: " + values.otherImmigrantStatus);
    }
    if (values.topics.includes("other")) {
      topics = topics.filter(function (value, index, arr) {
        return value !== "other";
      });
      topics.push("Other: " + values.otherTopics);
    }
    if (values.workstate.includes("other")) {
      workState = workState.filter(function (value, index, arr) {
        return value !== "other";
      });
      workState.push("other: " + values.otherWorkState);
    }

    const data = {
      email,
      name: `${values.firstName} ${values.lastName}`,
      age: values.age,
      organization: values.organization,
      immigrant_status: immigrantStatus,
      country: values.country,
      identify: values.genderIdentification,
      language: values.language,
      topics: topics,
      workstate: workState,
      isSocial: values.socialMedia,
      questions: values.questions,
      partner: values.partner,
      date_submitted: new Date(),
      role,
    };

    const res = await createApplication(data);
    setLoading(false);

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
            <Paragraph id="introduction">
              {t("menteeApplication.introduction")}
            </Paragraph>
          </Typography>
        </Form.Item>
        <Form.Item label={"Email"}>
          <Input value={email} readOnly />
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
          label={t("menteeApplication.immigrationStatus")}
          name="immigrantStatus"
          rules={[
            {
              required: true,
              message: t("common.requiredImmigrationStatus"),
            },
          ]}
        >
          <Select options={immigrantOptions} mode="multiple" />
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.immigrantStatus !== currentValues.immigrantStatus
          }
        >
          {({ getFieldValue }) =>
            getFieldValue("immigrantStatus")?.includes("other") ? (
              <Form.Item
                name="otherImmigrantStatus"
                rules={[
                  {
                    required: true,
                    message: t("common.requiredOtherImmigrantStatus"),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            ) : null
          }
        </Form.Item>
        <Form.Item
          label={t("menteeApplication.countryPlaceholder")}
          name="country"
          rules={[
            {
              required: true,
              message: t("common.requiredHearAboutUs"),
            },
          ]}
        >
          <Select showSearch options={countryOptions} mode="single" />
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
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.genderIdentification !==
            currentValues.genderIdentification
          }
        >
          {({ getFieldValue }) =>
            getFieldValue("genderIdentification") === "other" ? (
              <Form.Item
                name="otherGenderIdentification"
                rules={[
                  {
                    required: true,
                    message: t("common.requiredOtherGenderIdentification"),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            ) : null
          }
        </Form.Item>
        <Form.Item
          label={t("menteeApplication.preferredLanguage")}
          name="language"
          rules={[
            {
              required: true,
              message: t("common.requiredLanguage"),
            },
          ]}
        >
          <Select
            mode="multiple"
            options={[
              ...(options.languages ?? []),
              { label: t("common.other"), value: "other" },
            ]}
          />
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.language !== currentValues.language
          }
        >
          {({ getFieldValue }) =>
            getFieldValue("language") === "other" ? (
              <Form.Item
                name="otherLanguage"
                rules={[
                  {
                    required: true,
                    message: t("common.requiredOtherLanguage"),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            ) : null
          }
        </Form.Item>
        <Form.Item
          label={t("menteeApplication.topicInterests")}
          name="topics"
          rules={[
            {
              required: true,
              message: t("common.requiredTopicInterests"),
            },
          ]}
        >
          <Select
            options={[
              ...(options.specializations ?? []),
              { label: t("common.other"), value: "other" },
            ]}
            mode="tags"
            placeholder={t("common.pleaseSelect")}
            tokenSeparators={[","]}
          />
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.topics !== currentValues.topics
          }
        >
          {({ getFieldValue }) =>
            getFieldValue("topics")?.includes("other") ? (
              <Form.Item
                name="otherTopic"
                rules={[
                  {
                    required: true,
                    message: t("common.requiredOtherTopic"),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            ) : null
          }
        </Form.Item>
        <Form.Item
          label={t("menteeApplication.workOptions")}
          name="workstate"
          rules={[
            {
              required: true,
              message: t("common.requiredWorkOptions"),
            },
          ]}
        >
          <Select mode="multiple" options={workOptions} />
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.workstate !== currentValues.workstate
          }
        >
          {({ getFieldValue }) =>
            getFieldValue("workstate")?.includes("other") ? (
              <Form.Item
                name="otherWorkstate"
                rules={[
                  {
                    required: true,
                    message: t("common.requiredOtherWorkstate"),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            ) : null
          }
        </Form.Item>
        <Form.Item
          label={t("menteeApplication.socialMedia")}
          name="socialMedia"
          rules={[
            {
              required: true,
              message: t("common.requiredSocialMedia"),
            },
          ]}
        >
          <Radio.Group>
            <Radio value={"yes"}>
              {t("menteeApplication.socialMediaOption1")}
            </Radio>
            <Radio value={"no"}>
              {t("menteeApplication.socialMediaOption2")}
            </Radio>
            <Radio value={"other"}>{t("common.other")}</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.socialMedia !== currentValues.socialMedia
          }
        >
          {({ getFieldValue }) =>
            getFieldValue("socialMedia") === "other" ? (
              <Form.Item
                name="otherSocialMedia"
                rules={[
                  {
                    required: true,
                    message: t("common.requiredOtherSocialMedia"),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            ) : null
          }
        </Form.Item>
        <Form.Item
          label={t("menteeApplication.otherQuestions")}
          name="questions"
        >
          <Input.TextArea
            rows={3}
            placeholder={t("menteeApplication.questionsPlaceholder")}
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
          <Select options={[...partnerOptions]} />
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
export default MenteeApplication;
