const actions = {
  init: "INIT",
};

const initialState = {
  loaded: false,
  artifact: null,
  web3: null,
  accounts: null,
  networkID: null,
  contracts: {},
  tokenSaleAddress: null,
  userTokens: 1,
  userAddress: "",
};

const reducer = (state, action) => {
  const { type, data } = action;
  switch (type) {
    case actions.init:
      return { ...state, ...data };
    case actions.updateToken:
      return { ...state, ...data };
    default:
      throw new Error("Undefined reducer action type");
  }
};

export { actions, initialState, reducer };
