import {
  createReduxBoundAddListener,
  createReactNavigationReduxMiddleware,
} from 'react-navigation-redux-helpers';

import RootNavigator from '../navigators/RootNavigator';

const initialNavState = RootNavigator.router.getStateForAction(
  RootNavigator.router.getActionForPathAndParams('LoggedInNavigator')
);

const navStateMiddleware = createReactNavigationReduxMiddleware(
  "root",
  state => state.navState,
);
const addListener = createReduxBoundAddListener("root");

const navState = (state = initialNavState, action) => {
  // console.log(action, state.routes);
  const nextState = RootNavigator.router.getStateForAction(action, state);
  return nextState || state;
};

export default navState;
export {addListener, navStateMiddleware};