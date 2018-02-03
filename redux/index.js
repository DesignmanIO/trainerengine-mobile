import {createStore, combineReducers, applyMiddleware} from 'redux';

import navState, {navStateMiddleware} from './navState';

const initialAppState = {};
const appState = (state = initialAppState, action) => {
  const {type} = action;
  switch (type) {
    default: {
      return state;
    }
  }
}

const initialUserState = {}
const userState = (state = initialUserState, action) => {
  const {type} = action;
  switch (type) {
    default: {
      return state;
    }
  }
}

const Store = createStore(
  combineReducers({
    appState, 
    userState, 
    navState,
  }), applyMiddleware(navStateMiddleware));

export default Store;
