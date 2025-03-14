import SuccessIcon from "@/src/components/icons/Success/SuccessIcon";
import FailureIcon from "@/src/components/icons/Failure/FailureIcon";
import ActionButton from "@/src/components/common/ActionButton/ActionButton";
import {useCallback} from "react";
import {openNewTab} from "@/src/utils/common";
import {FuelAppUrl} from "@/src/utils/constants";
import styles from "./index.module.css";

export enum ModalType {
  "SUCCESS",
  "ERROR",
}

type StatusModalProps = {
  type: ModalType;
  transactionHash?: string;
  title: string;
  subTitle: string;
};

const StatusModal = ({
  subTitle,
  title,
  transactionHash,
  type,
}: StatusModalProps) => {
  const handleViewTransactionClick = useCallback(() => {
    if (!transactionHash) {
      return;
    }

    openNewTab(`${FuelAppUrl}/tx/${transactionHash}/simple`);
  }, [transactionHash]);

  return (
    <div className={styles.statusModal}>
      {type === ModalType.SUCCESS ? <SuccessIcon /> : <FailureIcon />}
      <div className={styles.statusContent}>
        <p className={styles.mainText}>{title}</p>
        <p className={styles.subText}>{subTitle}</p>
      </div>
      {transactionHash && (
        <ActionButton
          onClick={handleViewTransactionClick}
          className={styles.viewButton}
        >
          View transaction
        </ActionButton>
      )}
    </div>
  );
};

export default StatusModal;
