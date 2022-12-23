// const TokenSale = artifacts.require("MyTokenSale");
// const Token = artifacts.require("MyToken");
// const chai = require("./setupChai.js");
// const kycContract = artifacts.require("KycContract");

// const expect = chai.expect;
// const BN = web3.utils.BN;

// contract("TokenSale Test", function (accounts) {
//   const [deployerAccount, recipient] = accounts;

//   it("should not have any tokens in my deployerAccount", async () => {
//     let instance = await Token.deployed();
//     expect(
//       instance.balanceOf(deployerAccount)
//     ).to.eventually.be.a.bignumber.equal(new BN(0));
//   });

//   it("At tokens should be in the TokenSale Smart Contract by default", async () => {
//     let instance = await Token.deployed();
//     let balanceOfTokenSaleSmartContract = await instance.balanceOf(
//       TokenSale.address
//     );
//     let totalSupply = await instance.totalSupply();
//     expect(balanceOfTokenSaleSmartContract).to.be.a.bignumber.equal(
//       totalSupply
//     );
//   });

//   it("Should be possible to buy tokens", async () => {
//     let tokenInstance = await Token.deployed();
//     let tokenSaleInstance = await TokenSale.deployed();
//     let kycInstance = await kycContract.deployed();
//     let balanceBefore = await tokenInstance.balanceOf(deployerAccount);

//     await kycInstance.setKycCompleted(deployerAccount, {
//       from: deployerAccount,
//     });
//     await expect(
//       tokenSaleInstance.sendTransaction({
//         from: deployerAccount,
//         value: web3.utils.toWei("1", "wei"),
//       })
//     ).to.be.fulfilled;

//     balanceBefore = balanceBefore.add(new BN(1));

//     return expect(
//       tokenInstance.balanceOf(deployerAccount)
//     ).to.eventually.be.a.bignumber.equal(balanceBefore);
//   });
// });
