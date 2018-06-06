import Expo from 'expo';
import React, { Component } from 'react';
import { Text, View } from '@shoutem/ui';
import { StyleProvider } from '@shoutem/theme';
import Meteor from 'react-native-meteor';
import { Provider } from 'react-redux';

import Theme, { colors } from './Config/Theme';
import RootNavigator from './navigators/RootNavigator';
import Store from './redux';

Meteor.connect('wss://app.trainerengine.com/websocket');

class App extends Component {
  componentWillMount() {}
  render() {
    return (
      <Provider store={Store}>
        <StyleProvider style={Theme}>
          <RootNavigator />
        </StyleProvider>
      </Provider>
    );
  }
}

Expo.registerRootComponent(App);
