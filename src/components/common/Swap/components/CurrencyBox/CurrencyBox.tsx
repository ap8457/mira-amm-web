import {ChangeEvent, memo, useCallback} from "react";
import {clsx} from "clsx";

import Coin from "@/src/components/common/Coin/Coin";
import {CurrencyBoxMode} from "@/src/components/common/Swap/Swap";

import styles from "./CurrencyBox.module.css";
import TextButton from "@/src/components/common/TextButton/TextButton";
import {DefaultLocale, MinEthValueBN} from "@/src/utils/constants";
import {B256Address, BN} from "fuels";
import useAssetMetadata from "@/src/hooks/useAssetMetadata";

type Props = {
  value: string;
  assetId: B256Address | null;
  mode: CurrencyBoxMode;
  balance: BN;
  setAmount: (amount: string) => void;
  loading: boolean;
  onCoinSelectorClick: (mode: CurrencyBoxMode) => void;
  usdRate: number | null;
  previewError?: string | null;
};

const CurrencyBox = ({
  value,
  assetId,
  mode,
  balance,
  setAmount,
  loading,
  onCoinSelectorClick,
  usdRate,
  previewError,
}: Props) => {
  const metadata = useAssetMetadata(assetId);
  const balanceValue = balance.formatUnits(metadata.decimals || 0);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(",", ".");
    const re = new RegExp(`^[0-9]*[.]?[0-9]{0,${metadata.decimals || 0}}$`);

    if (re.test(inputValue)) {
      setAmount(inputValue);
    }
  };

  const handleCoinSelectorClick = () => {
    if (!loading) {
      onCoinSelectorClick(mode);
    }
  };

  const handleMaxClick = useCallback(() => {
    let amountStringToSet;
    // TODO ETH AssetId
    if (metadata.symbol === "ETH" && mode === "sell") {
      const amountWithoutGasFee = balance.sub(MinEthValueBN);
      amountStringToSet = amountWithoutGasFee.gt(0)
        ? amountWithoutGasFee.formatUnits(metadata.decimals || 0)
        : balanceValue;
    } else {
      amountStringToSet = balanceValue;
    }

    setAmount(amountStringToSet);
  }, [assetId, mode, balance, setAmount, metadata]);

  const coinNotSelected = assetId === null;

  const numericValue = parseFloat(value);
  const usdValue =
    !isNaN(numericValue) && Boolean(usdRate)
      ? (numericValue * usdRate!).toLocaleString(DefaultLocale, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : null;

  return (
    <div className={styles.currencyBox}>
      <p className={styles.title}>{mode === "buy" ? "Buy" : "Sell"}</p>
      <div className={styles.content}>
        {previewError ? (
          <div className={styles.warningBox}>
            <p className={styles.warningLabel}>{previewError}</p>
          </div>
        ) : (
          <input
            className={clsx(styles.input, loading && "blurredTextLight")}
            type="text"
            inputMode="decimal"
            pattern="^[0-9]*[.,]?[0-9]*$"
            placeholder="0"
            minLength={1}
            value={value}
            disabled={coinNotSelected || loading}
            onChange={handleChange}
          />
        )}
        <Coin assetId={assetId} onClick={handleCoinSelectorClick} />
      </div>
      <div className={styles.estimateAndBalance}>
        <p className={styles.estimate}>{usdValue !== null && `$${usdValue}`}</p>
        {balance.gt(0) && (
          <span className={styles.balance}>
            Balance: {balanceValue}
            &nbsp;
            <TextButton onClick={handleMaxClick}>Max</TextButton>
          </span>
        )}
      </div>
    </div>
  );
};

export default memo(CurrencyBox);
