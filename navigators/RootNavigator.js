import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import { connect } from 'react-redux';

import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import AuthLoading from './AuthLoading';

const RootNavigator = createSwitchNavigator(
  {
    AuthLoading,
    AppNavigator,
    AuthNavigator,
  },
  {
    initialRouteName: 'AuthLoading',
    navigationOptions: {},
    mode: 'card',
  },
);

const AppContainer = createAppContainer(RootNavigator);

export default AppContainer;
