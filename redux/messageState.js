import _ from 'lodash';

import C from './actionTypes';

const initialState = [];

const messageState = (state = initialState, action) => {
  switch (action.type) {
    case C.SEND_MESSAGE: {
      return [action.payload, ...state];
    }
    case C.SET_MESSAGES: {
      return action.payload || initialState;
    }
    case C.REMOVE_MESSAGE: {
      const { id } = action.payload;
      return [...state].filter(m => m.id !== id);
    }
    default: {
      return state;
    }
  }
};

export default messageState;
