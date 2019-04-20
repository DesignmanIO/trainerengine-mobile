import { createBottomTabNavigator } from 'react-navigation';

import { More, Tasks, Messages } from '~/Views';
import { colors } from '../Config/Theme';
import Store from '~/redux';

const MainNavigator = createBottomTabNavigator(
  {
    Tasks,
    Messages,
    More,
  },
  {
    swipeEnabled: false,
    animationEnabled: true,
    tabBarOptions: {
      activeTintColor: colors.purple,
    },
  },
);

export default MainNavigator;
