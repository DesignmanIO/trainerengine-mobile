import {StackNavigator} from 'react-navigation';
import {connect} from 'react-redux';

import LoggedInNavigator from './LoggedInNavigator'
import LoggedOutNavigator from './LoggedOutNavigator'

const RootNavigator = StackNavigator({
  LoggedInNavigator: {screen: LoggedInNavigator},
  LoggedOutNavigator: {screen: LoggedOutNavigator},
},
{
  initialRouteName: 'LoggedInNavigator',
  navigationOptions: {},
  mode: 'card',
});

export default RootNavigator;
