import Expo, { AppLoading } from 'expo';
import React, { Component } from 'react';
import Meteor from 'react-native-meteor';
import { Provider } from 'react-redux';

import { PubNubProvider } from './Components/PubNubContext';
import settings from './Config/settings';
import Theme, { colors, ThemeProvider } from './Config/Theme';
import RootNavigator from './navigators/RootNavigator';
import Store from './redux';
import startup from './startup';
// Meteor.connect("wss://app.coachfulness.app/websocket");

export default class App extends Component {
  constructor() {
    super();

    this.pubNub = null;

    this.state = {
      loaded: false,
    };
  }

  async componentDidMount() {
    const { pubNub } = await startup();
    this.pubNub = pubNub;
    this.setState({ loaded: true });
  }

  render() {
    const { loaded } = this.state;
    if (!loaded) return <AppLoading />;
    return (
      <Provider store={Store}>
        <PubNubProvider pubNub={this.pubNub}>
          <ThemeProvider>
            <RootNavigator />
          </ThemeProvider>
        </PubNubProvider>
      </Provider>
    );
  }
}
