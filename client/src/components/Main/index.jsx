import { useContext, useEffect, useState } from "react";
import StakeModal from "../Model";
import "./style.css";
import { EthContext } from "../../contexts/EthContext";
function convert(n) {
  var sign = +n < 0 ? "-" : "",
    toStr = n.toString();
  if (!/e/i.test(toStr)) {
    return n;
  }
  var [lead, decimal, pow] = n
    .toString()
    .replace(/^-/, "")
    .replace(/^([0-9]+)(e.*)/, "$1.$2")
    .split(/e|\./);

  return +pow < 0
    ? sign +
        "0." +
        "0".repeat(Math.max(Math.abs(pow) - 1 || 0, 0)) +
        lead +
        decimal
    : sign +
        lead +
        (+pow >= decimal?.length
          ? decimal + "0".repeat(Math.max(+pow - decimal?.length || 0, 0))
          : decimal.slice(0, +pow) + "." + decimal.slice(+pow));
}

function Main() {
  const { state } = useContext(EthContext);
  const { contracts, accounts, web3 } = state;

  const toEther = (wei) => {
    return Number(web3.utils.fromWei(String(wei)), "ether").toFixed(2);
  };
  const [tokenSymbols, setTokenSymbols] = useState([]);

  const [tokens, setTokens] = useState({});

  const [stakedTokens, setStakedTokens] = useState({});

  const [assets, setAssets] = useState([]);

  const [showStakeModal, setShowStakeModal] = useState(false);

  const [stakeTokenSymbol, setStakeTokenSymbol] = useState(undefined);

  const [stakeTokenQuantity, setStakeTokenQuantity] = useState(undefined);

  const [tokenContracts, setTokenContracts] = useState({});

  useEffect(() => {
    const { CAPPUTokenContract, StakingContract } = contracts;
    if (CAPPUTokenContract && StakingContract) {
      const onLoad = async () => {
        setTokenContracts((prev) => ({
          ["CAPPU"]: CAPPUTokenContract,
        }));

        const tokenSymbols = await StakingContract.methods
          .getTokenSymbols()
          .call();
        setTokenSymbols(tokenSymbols);

        tokenSymbols.map(async (symbol) => {
          const token = await StakingContract.methods.getToken(symbol).call();
          setTokens((prev) => ({ ...prev, [symbol]: token }));

          const stakedAmount = await StakingContract.methods
            .stakedTokens(symbol)
            .call();

          setStakedTokens((prev) => ({
            ...prev,
            [symbol]: toEther(stakedAmount),
          }));
        });
      };
      onLoad();
    }
  }, [contracts]);

  const isConnected = () => {
    if (accounts[0] !== undefined) {
      return accounts[0] !== undefined;
    }
  };

  const connectAndLoad = async () => {
    if (contracts?.StakingContract.methods) {
      const assetIdsHex = await contracts.StakingContract.methods
        .getPositionIdsForAddress()
        .call();

      const assetIds = assetIdsHex.map((id) => Number(id));
      const queriedAssets = await Promise.all(
        assetIds.map((id) =>
          contracts.StakingContract.methods.getPositionById(Number(id)).call()
        )
      );
      queriedAssets.map(async (asset) => {
        const tokensStaked = toEther(asset.usdValue);
        const ethAccruedInterestWei = await calcAccruedInterest(
          asset.apy,
          asset.ethValue,
          asset.createdDate
        );
        const ethAccruedInterest = toEther(convert(ethAccruedInterestWei));
        if (tokens["CAPPU"]?.usdPrice) {
          const usdAccruedInterest = (
            (convert(+ethAccruedInterest) * tokens["CAPPU"]?.usdPrice) /
            100
          ).toFixed(2);

          const parsedAsset = {
            positionId: Number(asset.positionId),
            tokenName: asset.name,
            tokenSymbol: asset.symbol,
            createdDate: asset.createdDate,
            apy: asset.apy / 100,
            tokensStaked: tokensStaked,
            usdValue: toEther(asset.usdValue) / 100,
            usdAccruedInterest: convert(+usdAccruedInterest),
            ethAccruedInterest: ethAccruedInterest,
            open: asset.open,
          };

          setAssets((prev) => [...prev, parsedAsset]);
        }
      });
    }
  };

  const calcAccruedInterest = async (apy, value, createdDate) => {
    if (contracts?.StakingContract.methods) {
      const numberOfDays = await contracts.StakingContract.methods
        .calculateNumberDays(createdDate)
        .call();
      const accruedInterest = await contracts.StakingContract.methods
        .calculateInterest(apy, value, numberOfDays)
        .call();

      return Number(accruedInterest);
    }
  };

  const openStakingModal = (tokenSymbol) => {
    setShowStakeModal(true);
    setStakeTokenSymbol(tokenSymbol);
  };

  const stakeTokens = async () => {
    if (contracts?.StakingContract) {
      const stakeTokenQuantityWei = web3.utils.toWei(
        stakeTokenQuantity,
        "ether"
      );

      await tokenContracts[stakeTokenSymbol].methods
        .approve(contracts.StakingContract._address, stakeTokenQuantityWei)
        .send({
          from: accounts[0],
        });

      await contracts?.StakingContract.methods
        .stakeTokens(stakeTokenSymbol, stakeTokenQuantityWei)
        .send({
          from: accounts[0],
        });
    }
  };

  const withdraw = (positionId) => {
    if (contracts?.StakingContract.methods) {
      contracts?.StakingContract.methods
        .closePosition(positionId)
        .send({ from: accounts[0] });
    }
  };

  const tokenRow = (tokenSymbol) => {
    const token = tokens[tokenSymbol];
    const amountStaked = !isNaN(Number(stakedTokens[tokenSymbol]))
      ? stakedTokens[tokenSymbol]
      : 0;
    const usdPrice = +token?.usdPrice / 100;
    return (
      <tr>
        <th scope="row">{displayLogo(token?.symbol)}</th>
        <td>{token?.symbol}</td>
        <td>{usdPrice.toFixed(2)}</td>
        <td>{amountStaked}</td>
        <td>
          {isConnected() && (
            <div
              className="orangeMiniButton"
              onClick={() => openStakingModal(tokenSymbol, "12%")}
            >
              Stake
            </div>
          )}
        </td>
      </tr>
    );
  };

  const displayLogo = (symbol) => {
    return (
      <>
        <img
          className="logoImg"
          src="https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png"
          alt=""
        />
      </>
    );
  };

  return (
    <div className="App">
      <div>
        <div className="marketContainer">
          <div className="subContainer">
            <span>
              <img
                className="logoImg"
                src="https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png"
                alt=""
              />
            </span>
            <span className="marketHeader">ETH Staking Market</span>
          </div>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th scope="col">Token</th>
              <th scope="col">Symbol</th>
              <th scope="col">Price (USD)</th>
              <th scope="col">Total </th>
              <th scope="col">action </th>
            </tr>
          </thead>
          <tbody>
            {tokenSymbols?.length > 0 &&
              Object.keys(tokens)?.length > 0 &&
              tokenSymbols.map((a, idx) => tokenRow(a))}
          </tbody>
        </table>
      </div>

      <div className="assetContainer">
        <div className="subContainer">
          <span className="marketHeader stakedTokensHeader">Your Staked</span>
        </div>

        <table class="table">
          <thead class="thead-light">
            <tr>
              <th scope="col">Token</th>
              <th scope="col">Symbol</th>
              <th scope="col">Amount</th>
              <th scope="col">Price created</th>
              <th scope="col">Price currently</th>
              <th scope="col">action</th>
            </tr>
          </thead>
          <tbody>
            {assets?.length > 0 &&
              assets.map((a, idx) => (
                <>
                  <tr key={idx}>
                    <th scope="row">{displayLogo(a.tokenSymbol)}</th>
                    <td>{a.tokenSymbol}</td>
                    <td>{a.tokensStaked}</td>
                    <td>0</td>
                    <td>0</td>
                    <td>
                      {a.open ? (
                        <div
                          onClick={() => withdraw(a.positionId)}
                          className="orangeMiniButton"
                        >
                          Withdraw
                        </div>
                      ) : (
                        <span>closed</span>
                      )}
                    </td>
                  </tr>
                </>
              ))}
          </tbody>
        </table>

        <div onClick={() => connectAndLoad()} className="connectButton">
          Connect Wallet
        </div>
      </div>
      {showStakeModal && (
        <StakeModal
          onClose={() => setShowStakeModal(false)}
          stakeTokenSymbol={stakeTokenSymbol}
          setStakeTokenQuantity={setStakeTokenQuantity}
          stakeTokens={stakeTokens}
        />
      )}
    </div>
  );
}

export default Main;
