import C from './actionTypes';

const actions = {
  setAuthToken(token = '') {
    return { type: C.SET_AUTHTOKEN, payload: token };
  },
};

export default actions;
