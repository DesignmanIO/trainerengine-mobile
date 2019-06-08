import React from 'react';
import { createStackNavigator, addNavigationHelpers } from 'react-navigation';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { navListener } from '../redux';
import { TabNavigator } from '~/navigators';

const AppNavigator = createStackNavigator(
  {
    Home: { screen: TabNavigator },
  },
  {
    mode: 'modal',
    navigationOptions: {
      header: null,
    },
  },
);

export default AppNavigator;
