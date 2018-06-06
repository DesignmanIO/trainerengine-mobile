import { AppNavigator } from '../views';

// Hack around issue that comes from separating this from AppNavigator code
// https://github.com/react-navigation/react-navigation/issues/3186
let Navigator = AppNavigator;

if (!AppNavigator) {
  Navigator = {
    router: {
      getStateForAction: () => null,
      getActionForPathAndParams: () => null,
    },
  };
}
// End hack

const initialState = Navigator.router.getStateForAction(Navigator.router.getActionForPathAndParams('Home'),
);

export default (state = initialState, action) => {
  const nextState = Navigator.router.getStateForAction(action, state);
  return nextState || state;
};
