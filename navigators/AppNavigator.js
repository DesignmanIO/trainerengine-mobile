import React from 'react';
import { createStackNavigator, addNavigationHelpers } from 'react-navigation';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { navListener } from '../redux';
import TabNavigator from './TabNavigator';

const AppNavigator = createStackNavigator(
  {
    Home: { screen: TabNavigator },
  },
  {
    mode: 'modal',
    // headerMode: 'none',
    // navigationOptions: {
    // },
  },
);

export default AppNavigator;
