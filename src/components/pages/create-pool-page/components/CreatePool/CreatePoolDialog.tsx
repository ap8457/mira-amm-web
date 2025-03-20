import ActionButton from "@/src/components/common/ActionButton/ActionButton";
import CoinPair from "@/src/components/common/CoinPair/CoinPair";
import CurrencyBox from "@/src/components/common/CurrencyBox/CurrencyBox";
import CoinsListModal from "@/src/components/common/Swap/components/CoinsListModal/CoinsListModal";
import ExchangeIcon from "@/src/components/icons/Exchange/ExchangeIcon";
import SparkleIcon from "@/src/components/icons/Sparkle/SparkleIcon";
import styles from "@/src/components/pages/add-liquidity-page/components/AddLiquidity/AddLiquidity.module.css";
import useAssetBalance from "@/src/hooks/useAssetBalance";
import useAssetMetadata from "@/src/hooks/useAssetMetadata";
import {useAssetPrice} from "@/src/hooks/useAssetPrice";
import useBalances from "@/src/hooks/useBalances/useBalances";
import useCheckActiveNetwork from "@/src/hooks/useCheckActiveNetwork";
import useCheckEthBalance from "@/src/hooks/useCheckEthBalance/useCheckEthBalance";
import useExchangeRateV2 from "@/src/hooks/useExchangeRate/useExchangeRateV2";
import useFaucetLink from "@/src/hooks/useFaucetLink";
import useModal from "@/src/hooks/useModal/useModal";
import usePoolsMetadata from "@/src/hooks/usePoolsMetadata";
import {createPoolKey, openNewTab} from "@/src/utils/common";
import {useConnectUI, useIsConnected} from "@fuels/react";
import {clsx} from "clsx";
import {B256Address, bn} from "fuels";
import {buildPoolId} from "mira-dex-ts";
import Link from "next/link";
import {Dispatch, SetStateAction, useCallback, useRef, useState} from "react";
import {useDebounceCallback} from "usehooks-ts";
import {CreatePoolPreviewData} from "./PreviewCreatePoolDialog";

type Props = {
  setPreviewData: Dispatch<SetStateAction<CreatePoolPreviewData | null>>;
};

const CreatePoolDialog = ({setPreviewData}: Props) => {
  const [AssetsListModal, openAssetsListModal, closeAssetsListModal] =
    useModal();

  const {isConnected, isPending: isConnecting} = useIsConnected();
  const {connect} = useConnectUI();
  const {balances} = useBalances();

  const [firstAssetId, setFirstAssetId] = useState<string | null>(null);
  const [secondAssetId, setSecondAssetId] = useState<string | null>(null);
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);

  const firstAssetBalanceValue = useAssetBalance(balances, firstAssetId);
  const secondAssetBalanceValue = useAssetBalance(balances, secondAssetId);

  const [firstAmount, setFirstAmount] = useState("");
  const [firstAmountInput, setFirstAmountInput] = useState("");
  const [secondAmount, setSecondAmount] = useState("");
  const [secondAmountInput, setSecondAmountInput] = useState("");
  const [activeAsset, setActiveAsset] = useState<B256Address | null>(null);
  const [isStablePool, setIsStablePool] = useState(false);

  const activeAssetForAssetSelector = useRef<string | null>(null);

  const firstAssetMetadata = useAssetMetadata(firstAssetId);
  const secondAssetMetadata = useAssetMetadata(secondAssetId);

  const pools =
    firstAssetId && secondAssetId
      ? [buildPoolId(firstAssetId, secondAssetId, isStablePool)]
      : undefined;
  const {poolsMetadata} = usePoolsMetadata(pools);
  const poolExists = Boolean(poolsMetadata && poolsMetadata?.[0]);
  let existingPoolKey = "";
  if (poolExists) {
    const poolId = poolsMetadata?.[0]?.poolId || poolsMetadata?.[1]?.poolId;
    if (poolId) {
      existingPoolKey = createPoolKey(poolId);
    }
  }

  const debouncedSetFirstAmount = useDebounceCallback(setFirstAmount, 500);
  const debouncedSetSecondAmount = useDebounceCallback(setSecondAmount, 500);

  const handleStabilityChange = (isStable: boolean) =>
    setIsStablePool(isStable);

  const setAmount = useCallback(
    (coin: B256Address | null) => {
      if (!coin) {
        return () => void 0;
      }

      return (value: string) => {
        if (coin === firstAssetId) {
          debouncedSetFirstAmount(value);
          setFirstAmountInput(value);
        } else {
          debouncedSetSecondAmount(value);
          setSecondAmountInput(value);
        }
        setActiveAsset(coin);
      };
    },
    [debouncedSetFirstAmount, debouncedSetSecondAmount, firstAssetId],
  );

  const sufficientEthBalanceForFirstCoin = useCheckEthBalance({
    assetId: firstAssetId,
    amount: firstAmount,
  });
  const sufficientEthBalanceForSecondCoin = useCheckEthBalance({
    assetId: secondAssetId,
    amount: secondAmount,
  });
  const sufficientEthBalance =
    sufficientEthBalanceForFirstCoin && sufficientEthBalanceForSecondCoin;

  const faucetLink = useFaucetLink();
  const handleButtonClick = useCallback(() => {
    if (!sufficientEthBalance) {
      openNewTab(faucetLink);
      return;
    }

    setPreviewData(
      firstAssetId && secondAssetId
        ? {
            assets: [
              {
                assetId: firstAssetId,
                amount: firstAmount,
              },
              {
                assetId: secondAssetId,
                amount: secondAmount,
              },
            ],
            isStablePool,
          }
        : null,
    );
  }, [
    sufficientEthBalance,
    setPreviewData,
    firstAssetId,
    firstAmount,
    secondAssetId,
    secondAmount,
    isStablePool,
    faucetLink,
  ]);

  const isValidNetwork = useCheckActiveNetwork();

  const insufficientFirstBalance = bn
    .parseUnits(firstAmount, firstAssetMetadata.decimals)
    .gt(firstAssetBalanceValue);
  const insufficientSecondBalance = bn
    .parseUnits(secondAmount, secondAssetMetadata.decimals)
    .gt(secondAssetBalanceValue);
  const insufficientBalance =
    insufficientFirstBalance || insufficientSecondBalance;
  const oneOfAssetsIsNotSelected =
    firstAssetId === null || secondAssetId === null;
  const oneOfAmountsIsEmpty =
    !firstAmount ||
    !secondAmount ||
    firstAmount === "0" ||
    secondAmount === "0";

  let buttonTitle = "Preview creation";
  if (!isValidNetwork) {
    buttonTitle = "Incorrect network";
  } else if (oneOfAssetsIsNotSelected) {
    buttonTitle = "Choose assets";
  } else if (insufficientBalance) {
    buttonTitle = "Insufficient balance";
  } else if (!sufficientEthBalance) {
    buttonTitle = "Claim some ETH to pay for gas";
  } else if (oneOfAmountsIsEmpty) {
    buttonTitle = "Enter asset amounts";
  }

  const buttonDisabled =
    !isValidNetwork ||
    poolExists ||
    oneOfAssetsIsNotSelected ||
    oneOfAmountsIsEmpty ||
    insufficientBalance;

  const handleAssetClick = useCallback(
    (assetId: string | null) => {
      return () => {
        openAssetsListModal();
        activeAssetForAssetSelector.current = assetId;
      };
    },
    [openAssetsListModal],
  );

  const handleAssetSelection = useCallback(
    (selectedAssetId: B256Address | null) => {
      if (activeAssetForAssetSelector.current === firstAssetId) {
        if (selectedAssetId === secondAssetId) {
          setSecondAssetId(firstAssetId);
        }
        setFirstAssetId(selectedAssetId);
      } else {
        if (selectedAssetId === firstAssetId) {
          setFirstAssetId(secondAssetId);
        }
        setSecondAssetId(selectedAssetId);
      }

      closeAssetsListModal();
    },
    [firstAssetId, secondAssetId, closeAssetsListModal],
  );

  const firstAssetPrice = useAssetPrice(firstAssetId);
  const secondAssetPrice = useAssetPrice(secondAssetId);

  const exchangeRate = useExchangeRateV2({
    firstAssetId,
    secondAssetId,
    firstAssetAmount: firstAmount,
    secondAssetAmount: secondAmount,
    baseAssetId: activeAssetId,
  });

  const handleExchangeRateSwap = () => {
    setActiveAssetId((prevActiveAssetId) =>
      prevActiveAssetId === firstAssetId ? secondAssetId : firstAssetId,
    );
  };

  return (
    <>
      <div className={styles.section}>
        <p>Selected pair</p>
        <div className={styles.sectionContent}>
          <div className={styles.coinPair}>
            {!oneOfAssetsIsNotSelected && (
              <CoinPair
                firstCoin={firstAssetId}
                secondCoin={secondAssetId}
                isStablePool={isStablePool}
              />
            )}
          </div>
          <div className={styles.poolStability}>
            <div
              className={clsx(
                styles.poolStabilityButton,
                !isStablePool && styles.poolStabilityButtonActive,
              )}
              onClick={() => handleStabilityChange(false)}
              role="button"
            >
              <div className={styles.poolStabilityButtonContent}>
                <span className={styles.poolStabilityButtonText}>
                  0.30% fee tier (Volatile pool)
                </span>
                {/* <Info
                  tooltipText={VolatilePoolTooltip}
                  tooltipKey="volatilePool"
                /> */}
              </div>
            </div>
            <div
              className={clsx(
                styles.poolStabilityButton,
                isStablePool && styles.poolStabilityButtonActive,
              )}
              onClick={() => handleStabilityChange(true)}
              role="button"
            >
              <div className={styles.poolStabilityButtonContent}>
                <span className={styles.poolStabilityButtonText}>
                  0.05% fee tier (Stable pool)
                </span>
                {/* <Info tooltipText={StablePoolTooltip} tooltipKey="stablePool" /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.section}>
        <p>Deposit amount</p>
        <div className={styles.sectionContent}>
          <CurrencyBox
            assetId={firstAssetId}
            value={firstAmountInput}
            loading={poolExists}
            setAmount={setAmount(firstAssetId)}
            balance={firstAssetBalanceValue}
            usdRate={firstAssetPrice.price}
            // onAssetClick={handleAssetClick(firstAssetId)}
          />
          <CurrencyBox
            assetId={firstAssetId}
            value={firstAmountInput}
            loading={poolExists}
            setAmount={setAmount(firstAssetId)}
            balance={firstAssetBalanceValue}
            usdRate={firstAssetPrice.price}
            // onAssetClick={handleAssetClick(firstAssetId)}
          />
        </div>
      </div>
      {poolExists && (
        <div className={styles.existingPoolBlock}>
          <div className={styles.sparkleIcon}>
            <SparkleIcon />
          </div>
          <p className={styles.existingPoolText}>This pool already exists</p>
          <Link
            href={`/liquidity/add/?pool=${existingPoolKey}`}
            className={styles.addLiquidityLink}
          >
            Add liquidity →
          </Link>
        </div>
      )}
      {!poolExists && !oneOfAssetsIsNotSelected && !oneOfAmountsIsEmpty && (
        <div className={styles.section}>
          <p>Starting price</p>
          <div className={styles.priceBlock} onClick={handleExchangeRateSwap}>
            <p>{exchangeRate}</p>
            <ExchangeIcon />
          </div>
          <p className={styles.priceWarning}>
            This is the price of the pool on inception. Always double check
            before deploying a pool.
          </p>
        </div>
      )}
      {!isConnected ? (
        <ActionButton
          variant="secondary"
          onClick={connect}
          loading={isConnecting}
        >
          Connect Wallet
        </ActionButton>
      ) : (
        <ActionButton disabled={buttonDisabled} onClick={handleButtonClick}>
          {buttonTitle}
        </ActionButton>
      )}
      <AssetsListModal title="Choose token">
        <CoinsListModal selectCoin={handleAssetSelection} balances={balances} />
      </AssetsListModal>
    </>
  );
};

export default CreatePoolDialog;
