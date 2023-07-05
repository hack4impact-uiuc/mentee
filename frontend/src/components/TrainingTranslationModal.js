import React, { useState } from "react";
import { Modal, notification } from "antd";
import { translateDocuments } from "utils/api";

import "components/css/Training.scss";

function TrainingTranslationModal({
  trainingId,
  openModal,
  setOpenModal,
  documentCost,
}) {
  const [translateLoading, setTranslateLoading] = useState(false);

  const handleTranslateConfirm = async (trainingId) => {
    setTranslateLoading(true);
    const res = await translateDocuments(trainingId);
    if (!res?.success) {
      notification.error({
        message: "ERROR",
        description: `Couldn't translate file`,
      });
    } else {
      notification.success({
        message: "SUCCESS",
        description: "Translation has been done successfully",
      });
    }
    setOpenModal(false);
    setTranslateLoading(false);
  };

  return (
    <div>
      <Modal
        title={"Translate Training"}
        okText="Yes"
        onOk={() => handleTranslateConfirm(trainingId)}
        onCancel={() => {
          setOpenModal(false);
          notification.info({
            message: "INFO",
            description: `No translation has been done`,
          });
        }}
        open={openModal}
        confirmLoading={translateLoading}
      >
        <div className="translate-modal-container">
          {`Are you sure you want to translate? This will cost you ${documentCost}`}
        </div>
      </Modal>
    </div>
  );
}

export default TrainingTranslationModal;
