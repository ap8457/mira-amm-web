import React from "react";
import CoinWithAmount from "@/src/components/common/CoinWithAmount/CoinWithAmount";
import styles from "./ReserveItem.module.css";
import {useFormattedReserveValue} from "./useFormattedReserveValue";
import Loader from "@/src/components/common/Loader/Loader";

interface ReserveItemsProps {
  assetId: string;
  amount: string;
  reserve: number | undefined;
}

const ReserveItem = ({
  assetId,
  amount,
  reserve,
}: ReserveItemsProps): JSX.Element => {
  const {usdValue, coinAmount} = useFormattedReserveValue(
    assetId,
    amount,
    reserve,
  );

  return (
    <div className={styles.reserveItems}>
      <CoinWithAmount assetId={assetId} amount={coinAmount} withName />
      {usdValue && reserve ? (
        <div className={styles.reserveValues}>
          <p className="mc-mono-l">
            {Number(reserve?.toFixed(2)).toLocaleString()}
          </p>
          {usdValue && (
            <p className="mc-mono-m">${usdValue === "NaN" ? "~0" : usdValue}</p>
          )}
        </div>
      ) : (
        <Loader color="gray" />
      )}
    </div>
  );
};

export default ReserveItem;
