import {TabNavigator} from 'react-navigation'

import Messages from '../Views/Messages';
import Tasks from '../Views/Tasks';
import More from '../Views/More';
import {colors} from '../Config/Theme';

const MainNavigator = TabNavigator ({
  Tasks: {screen: Tasks},
  Messages: {screen: Messages},
  More: {screen: More},
},{
  swipeEnabled: false,
  animationEnabled: true,
  tabBarOptions: {
    activeTintColor: colors.purple,
  }
});

export default MainNavigator;
