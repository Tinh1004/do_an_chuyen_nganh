const MyToken = artifacts.require("MyToken");
const Staking = artifacts.require("Staking");
const chai = require("./setupChai.js");
const expect = chai.expect;

contract("Staking", async function (accounts) {
  beforeEach(async () => {
    StakingDeploy = await Staking.deployed(187848);

    MyTokenDeploy = await MyToken.deployed();

    await StakingDeploy.addToken(
      "My CAPPU tokens",
      "CAPPU",
      MyTokenDeploy.address,
      867,
      1500
    );

    await MyTokenDeploy.approve(
      StakingDeploy.address,
      web3.utils.toWei("100", "ether")
    );
    StakingDeploy.stakeTokens("CAPPU", web3.utils.toWei("100", "ether"));
  });

  describe("addToken", () => {
    it("adds a token symbol", async () => {
      const tokenSymbols = await StakingDeploy.getTokenSymbols();
      expect(tokenSymbols).to.eql(["CAPPU", "CAPPU"]);
    });

    it("adds token information", async () => {
      const token = await StakingDeploy.getToken("CAPPU");
      expect(+token.tokenId).to.equal(3);
      expect(token.name).to.equal("My CAPPU tokens");
      expect(token.symbol).to.equal("CAPPU");
      expect(token.tokenAddress).to.equal(MyTokenDeploy.address);
      expect(+token.usdPrice).to.equal(867);
      expect(+token.ethPrice).to.equal(0);
      expect(+token.apy).to.equal(1500);
    });

    it("increments currentTokenId", async () => {
      currentTokenId = await StakingDeploy.currentTokenId();
      expect(+currentTokenId.toNumber()).to.equal(5);
    });
  });
});
