import React, { useReducer, useCallback, useEffect } from "react";
import Web3 from "web3";
import EthContext from "./EthContext";
import { reducer, actions, initialState } from "./state";

const REACT_APP_NETWORK_ID = process.env.REACT_APP_NETWORK_ID;
function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const init = useCallback(async (artifact) => {
    const { myTokenSale, CAPPUToken, kycContract, Staking } = artifact;
    if (myTokenSale && CAPPUToken && kycContract) {
      const web3 = new Web3(Web3.givenProvider || "ws://localhost:7545");
      const accounts = await web3.eth.requestAccounts();
      const networkID = await web3.eth.net.getId();
      const { abi: myTokenSaleAbi } = myTokenSale;
      const { abi: myTokenAbi } = CAPPUToken;
      const { abi: StakingAbi } = Staking;
      const { abi: kycAbi } = kycContract;

      if (networkID === 5777 || networkID === 5) {
        let CAPPUTokenAddress,
          StakingAbiAddress,
          myTokenSaleAddress,
          kycAddress,
          CAPPUTokenInstance,
          StakingInstance,
          tokenSaleInstance,
          kycInstance,
          userTokens;

        try {
          CAPPUTokenAddress = CAPPUToken.networks[networkID].address;
          StakingAbiAddress = Staking.networks[networkID].address;
          myTokenSaleAddress = myTokenSale.networks[networkID].address;
          kycAddress = kycContract.networks[networkID].address;
          CAPPUTokenInstance = new web3.eth.Contract(
            myTokenAbi,
            CAPPUTokenAddress
          );
          StakingInstance = new web3.eth.Contract(
            StakingAbi,
            StakingAbiAddress
          );

          tokenSaleInstance = new web3.eth.Contract(
            myTokenSaleAbi,
            myTokenSaleAddress
          );
          kycInstance = new web3.eth.Contract(kycAbi, kycAddress);
        } catch (err) {
          console.error(err);
        }

        const updateUserTokens = async () => {
          if (CAPPUTokenInstance !== undefined) {
            userTokens = await CAPPUTokenInstance.methods
              .balanceOf(accounts[0])
              .call();
            dispatch({
              type: actions.updateToken,
              data: {
                userTokens,
              },
            });
          }
        };
        updateUserTokens();

        const listenToTokenTransfer = () => {
          if (CAPPUTokenInstance !== undefined) {
            CAPPUTokenInstance.events
              .Transfer({ to: accounts[0] })
              .on("data", updateUserTokens);
          }
        };

        listenToTokenTransfer();
        dispatch({
          type: actions.init,
          data: {
            artifact,
            web3,
            accounts,
            networkID,
            contracts: {
              tokenInstance: CAPPUTokenInstance,
              tokenSaleInstance,
              kycInstance,
              CAPPUTokenContract: CAPPUTokenInstance,
              StakingContract: StakingInstance,
            },
            loaded: true,
            tokenSaleAddress: myTokenSale.networks[networkID].address,
            tokenInstance: CAPPUTokenInstance,
            tokenSaleInstance,
          },
        });
      } else {
        alert("Network ID: " + networkID + " is correct");
      }
    }
  }, []);

  useEffect(() => {
    const tryInit = async () => {
      try {
        const CAPPUToken = require("../../contracts/MyToken.json");
        const myTokenSale = require("../../contracts/MyTokenSale.json");
        const kycContract = require("../../contracts/KycContract.json");
        const Staking = require("../../contracts/Staking.json");

        const artifact = {
          CAPPUToken,
          myTokenSale,
          kycContract,
          Staking,
        };
        init(artifact);
      } catch (err) {
        console.error(err);
      }
    };

    tryInit();
  }, [init]);

  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = () => {
      init(state.artifact);
    };

    events.forEach((e) => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach((e) => window.ethereum.removeListener(e, handleChange));
    };
  }, [init, state.artifact]);

  if (!state.loaded) return <h1>loading 2 ....</h1>;
  return (
    <EthContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
