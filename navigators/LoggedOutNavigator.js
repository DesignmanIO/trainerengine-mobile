import {StackNavigator} from 'react-navigation'
import {connect} from 'react-redux';

import Login from '../Views/Login';

const LoggedInRootNavigator = StackNavigator({
  Login: {screen: Login},
});

export default LoggedInRootNavigator;