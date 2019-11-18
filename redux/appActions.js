import C from './actionTypes';

const appActions = {
  reduxReady() {
    return { type: C.REDUXREADY };
  },
};

export default appActions;
