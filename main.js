import Expo from 'expo';
import React, {Component} from 'react';
import {Text,View,} from '@shoutem/ui';
import {StyleProvider} from '@shoutem/theme';
import Meteor from 'react-native-meteor';
import {Provider} from 'react-redux'
import {addNavigationHelpers} from 'react-navigation';
import {addListener} from './redux/navState';

import Theme, {colors} from './Config/Theme';
import RootNavigator from './navigators/RootNavigator';
import Store from './redux';

Meteor.connect('wss://app.trainerengine.com/websocket');

const ReduxNavigator = connect(({navState})=>navState)(<RootNavigator navigation={addNavigationHelpers({
  dispatch: props.dispatch,
  state: props.navState,
  addListener,
})}/>)

class App extends Component {
  componentWillMount() {
    
  }
  render() {
    return (
      <Provider store={Store}>
        <StyleProvider style={Theme}>
        <RootNavigator />
        </StyleProvider>
      </Provider>
    )
  }
}

Expo.registerRootComponent(App);
