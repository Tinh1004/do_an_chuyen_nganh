const MyToken = artifacts.require("MyToken");
const Staking = artifacts.require("Staking");
const MyTokenSale = artifacts.require("MyTokenSale");
const MyKycContract = artifacts.require("KycContract");

module.exports = async function (deployer) {
  let addr = await web3.eth.getAccounts();

  const StakingDeploy = await deployer.deploy(
    Staking,
    web3.utils.toWei("100", "ether")
  );

  const MyKyc = await deployer.deploy(MyKycContract);
  const MyTokenDeploy = await deployer.deploy(MyToken);

  await deployer.deploy(
    MyTokenSale,
    1,
    addr[0],
    MyTokenDeploy.address,
    MyKyc.address
  );

  await MyTokenDeploy.transfer(MyTokenSale.address, 10000000000);
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

  await StakingDeploy.stakeTokens("CAPPU", web3.utils.toWei("100", "ether"));

  console.log("My token: ", MyTokenDeploy.address);
};
