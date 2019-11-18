import React from 'react';
import { createStackNavigator, addNavigationHelpers } from 'react-navigation';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { navListener } from '../redux';
import DrawerNavigator from './DrawerNavigator';

const AppNavigator = createStackNavigator(
  {
    Home: DrawerNavigator,
  },
  {
    mode: 'modal',
    // headerMode: 'none',
    // navigationOptions: {
    // },
  },
);

export default AppNavigator;
