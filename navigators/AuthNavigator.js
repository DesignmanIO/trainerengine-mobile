import { createStackNavigator } from 'react-navigation';
import { Login } from '../Views';

const AuthNavigator = createStackNavigator(
  {
    Login,
  },
  { headerMode: 'none' },
);

export default AuthNavigator;
