import C from './actionTypes';

const initialState = {
  authToken: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case C.SET_AUTHTOKEN: {
      return { ...state, authToken: action.payload };
    }
    default:
      return state;
  }
};
