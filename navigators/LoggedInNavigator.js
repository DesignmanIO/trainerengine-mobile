import {StackNavigator} from 'react-navigation'
import {connect} from 'react-redux';

import MainTabNavigator from './MainTabNavigator';

const LoggedInRootNavigator = StackNavigator({
  Home: {screen: MainTabNavigator},
});

export default LoggedInRootNavigator;