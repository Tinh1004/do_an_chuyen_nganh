import { useContext, useState } from "react";
import styled from "styled-components";
import { EthContext } from "../../contexts/EthContext";

const WelcomeEle = styled.div`
  width: 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin: 20px;
  .main-search-input {
    background: #fff;
    padding: 0 120px 0 0;
    border-radius: 1px;
    box-shadow: 0px 0px 0px 6px rgba(255, 255, 255, 0.3);
  }

  input {
    padding: 0.3rem 2rem;
    margin-right: 5px;
    border-radius: 5px;
    border: 1px solid grey;
  }

  input.form-control {
    padding: 0.3rem 2rem;
    margin-right: 5px;
    border-radius: 5px;
  }
  button {
    border-radius: 5px;
    padding: 0.3rem 0.8rem;
    border: none;
    background-color: orange;
    color: white;
    margin-top: 10px;
  }
  button:hover {
    transition: all 0.5s;
    background-color: blue;
  }
`;
function Welcome() {
  const [kycAddress, setKycAddress] = useState("0x234...");
  const [inputNFT, setInputNFT] = useState(0);
  const { state } = useContext(EthContext);

  const handleKycWhiteListSubmit = async () => {
    if (state.contracts && state.accounts) {
      if (kycAddress.length > 15) {
        await state.contracts.kycInstance.methods
          .setKycCompleted(kycAddress)
          .send({ from: state.accounts[0] });
        alert("Kyc for " + kycAddress + "is completed");
      } else {
        alert("Please fill out all the fields");
      }
    }
  };

  const handleBuyTokens = async () => {
    if (state.tokenInstance !== undefined) {
      if (inputNFT) {
        await state.tokenSaleInstance.methods
          .buyTokens(state.accounts[0])
          .send({
            from: state.accounts[0],
            value: state.web3.utils.toWei(inputNFT, "wei"),
          });
      } else {
        alert("Number not 0");
      }
    }
  };

  return (
    <WelcomeEle className="welcome">
      <h2>Kyc Whitelisting</h2>
      Address to allowed: {kycAddress}
      <div className="container d-flex justify-content-center">
        <div className="input-group col-sm-7  input-group-lg">
          <input
            type="text"
            className="form-control"
            value={state.kycAddress}
            onChange={(e) => setKycAddress(e.target.value)}
          />
          <div className="input-group-append">
            <button onClick={handleKycWhiteListSubmit}> KYC</button>
          </div>
        </div>
      </div>
      <hr />
      <h2>Buy Token</h2>
      <p>
        If you want to buy tokens, send Wei to this address:{" "}
        {state.tokenSaleAddress}
      </p>
      <p>Your currently have: {state.userTokens} CAPPU tokens.</p>
      <div className="main-search-input-wrap">
        <div className="main-search-input fl-wrap">
          <div className="main-search-input-item">
            <input
              type="number"
              value={inputNFT}
              placeholder="Enter nft amount"
              onChange={(e) => setInputNFT(e.target.value)}
              style={{ fontSize: "20px" }}
            />
          </div>

          <button className="main-search-button" onClick={handleBuyTokens}>
            Buy more tokens
          </button>
        </div>
      </div>
    </WelcomeEle>
  );
}

export default Welcome;
