"use strict";

var chai = require("chai");
const BN = web3.utils.BN;
const chaiBN = require("chai-bn")(BN);
chai.use(chaiBN);

var chaiAsPromise = require("chai-as-promised");
chai.use(chaiAsPromise);

module.exports = chai;
