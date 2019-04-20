import React from 'react';
import { createStackNavigator, addNavigationHelpers } from 'react-navigation';
import { connectStyle } from '@shoutem/theme';
import { View } from '@shoutem/ui';
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
