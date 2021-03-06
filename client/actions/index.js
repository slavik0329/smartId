export const SET_WALLET_ADDRESS = 'SET_WALLET_ADDRESS';
export const SET_ID_ADDRESS = 'SET_ID_ADDRESS';
export const SET_MY_IDENTITY = 'SET_MY_IDENTITY';
export const SET_SEARCHED_IDENTITY = 'SET_SEARCHED_IDENTITY';

export function setWalletAddress(addresses) {
  return {
    type: SET_WALLET_ADDRESS,
    payload: addresses
  };
}

export function setIdAddress(addresses) {
  return {
    type: SET_ID_ADDRESS,
    payload: addresses
  };
}

export function setMyIdentity(contract) {
  return {
    type: SET_MY_IDENTITY,
    payload: contract
  };
}

export function setSearchedIdentity(contract) {
  return {
    type: SET_SEARCHED_IDENTITY,
    payload: contract
  };
}
