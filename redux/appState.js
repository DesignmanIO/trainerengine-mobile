import C from './actionTypes';

const initialState = {
  loading: false,
  reduxReady: false
};

export default (state = initialState, action) => {
  switch (action.type) {
    case C.REDUXREADY: {
      return { ...state, reduxReady: true };
    }
    default:
      return state;
  }
};
