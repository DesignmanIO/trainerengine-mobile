import Exponent from 'exponent';
import React, {Component} from 'react';
import {Text,View,} from '@shoutem/ui';
import {StyleProvider} from '@shoutem/theme';
import {StackNavigator, TabNavigator} from 'react-navigation'

import Theme, {colors} from './Config/Theme';
import Messages from './Views/Messages';
import Tasks from './Views/Tasks';
import More from './Views/More';

const xComponent = (props) => <View><Text>Test</Text></View>;
const zComponent = (props) => <View><Text>Tester</Text></View>;

const MainNavigation = TabNavigator ({
  Tasks: {screen: Tasks},
  Messages: {screen: Messages},
  More: {screen: More},
},{
  swipeEnabled: true,
  animationEnabled: true,
  tabBarOptions: {
      activeTintColor: colors.purple,
  }
});

const RootNavigation = StackNavigator({
  Home: {screen: MainNavigation},
})

const App = (props) => {
  return (
    <StyleProvider style={Theme}>
      <RootNavigation />
    </StyleProvider>
  )
}

Exponent.registerRootComponent(App);
