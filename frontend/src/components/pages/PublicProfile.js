import React, { useEffect, useState } from "react";
import { UserOutlined } from "@ant-design/icons";
import { Avatar } from "antd";
import { withRouter } from "react-router-dom";

import ProfileContent from "components/ProfileContent";
import ProfileVideos from "components/ProfileVideos";
import { fetchAccountById } from "utils/api";

import "../css/PublicProfile.scss";
import { ACCOUNT_TYPE } from "utils/consts";
import MenteeVideo from "components/MenteeVideo";

function PublicProfile({ match }) {
  const accountType = match.params.type;
  const id = match.params.id;
  const [account, setAccount] = useState({});
  const [updateContent, setUpdateContent] = useState(false);
  const [isMentor, setIsMentor] = useState(accountType == ACCOUNT_TYPE.MENTOR);

  useEffect(() => {
    async function getAccount() {
      const accountData = await fetchAccountById(id, accountType);
      if (accountData) {
        setAccount(accountData);
      }
    }
    getAccount();
  }, [updateContent, id]);

  const handleUpdateAccount = () => {
    setUpdateContent(!updateContent);
  };

  return (
    <div className="mentor-profile-flexbox">
      <div
        className={
          "mentor-profile-content-public" +
          (!isMentor ? " mentee-public-content" : "")
        }
      >
        <div style={{ minWidth: "65%" }}>
          <Avatar
            size={120}
            src={account.image && account.image.url}
            icon={<UserOutlined />}
          />
          <ProfileContent
            account={account}
            mentor={account}
            id={id}
            handleUpdateAccount={handleUpdateAccount}
            accountType={parseInt(accountType)}
          />
        </div>
        {accountType == ACCOUNT_TYPE.MENTEE && account.video && (
          <MenteeVideo video={account.video} />
        )}
      </div>
      {isMentor && (
        <div className="mentor-profile-videos">
          <ProfileVideos videos={account.videos} />
        </div>
      )}
    </div>
  );
}

export default withRouter(PublicProfile);
