import React from 'react';
import { createBottomTabNavigator, BottomTabBar } from 'react-navigation';

import { More, Tasks, Messages } from '../Views';
import { colors } from '../Config/Theme';
import store from '../redux';

const TabNavigator = createBottomTabNavigator(
  {
    Tasks,
    Messages,
    More,
  },
  {
    swipeEnabled: false,
    animationEnabled: true,
    tabBarOptions: {
      showIcon: true,
      inactiveTintColor: colors.grey,
      activeTintColor: colors.blue,
      style: {
        height: 70,
      },
    },
  },
);

export default TabNavigator;
