import React from 'react';
import { createDrawerNavigator, SafeAreaView } from 'react-navigation';

import TabNavigator from './TabNavigator';
import { Account } from '../Views';
import { DrawerContent } from '../Components/Navigation';

const DrawerNavigator = createDrawerNavigator(
  { TabNavigator, Account },
  {
    drawerPosition: 'right',
    contentComponent: DrawerContent,
  },
);

export default DrawerNavigator;
