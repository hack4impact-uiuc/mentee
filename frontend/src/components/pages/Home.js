import React from "react";
import { UserOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { useHistory, withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { css } from "@emotion/css";
import { Space } from "antd";
import SelectCard from "components/SelectCard";
import "../css/Home.scss";

const SelectCardsStyle = css`
  width: 100%;
  flex: 1;
  justify-content: center;
  @media (max-width: 991px) {
    flex: 0;
    margin-top: 5em;
  }
`;

function Home() {
  const { t } = useTranslation();
  const history = useHistory();

  return (
    <>
      <Space direction="vertical" className={SelectCardsStyle} size="middle">
        <SelectCard
          avatar={<UserOutlined />}
          title={t("homepage.existingAccountTitle")}
          description={t("homepage.existingAccountDesc")}
          onClick={() => {
            history.push("/login");
          }}
        />
        <SelectCard
          avatar={<UsergroupAddOutlined />}
          title={t("homepage.newAccountTitle")}
          description={t("homepage.newAccountDesc")}
          onClick={() =>
            history.push({
              pathname: "/apply",
            })
          }
        />
      </Space>
    </>
  );
}

export default withRouter(Home);
