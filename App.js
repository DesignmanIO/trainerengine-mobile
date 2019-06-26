import Expo, { AppLoading } from 'expo';
import React, { Component } from 'react';
import Meteor from 'react-native-meteor';
import { Provider } from 'react-redux';
// import PubNubReact from 'pubnub-react';

import settings from './Config/settings';
import Theme, { colors, ThemeProvider } from './Config/Theme';
import RootNavigator from './navigators/RootNavigator';
import Store from './redux';
import startup from './startup';
// Meteor.connect("wss://app.coachfulness.app/websocket");

export default class App extends Component {
  constructor() {
    super();

    // this.pubnub = new PubNubReact({
    //   publishKey: settings.pubNub.publishKey,
    //   subscribeKey: settings.pubNub.subscribeKey,
    // });
    // this.pubnub.init(this);

    this.state = {
      loaded: false,
    };
  }

  async componentDidMount() {
    await startup();
    this.setState({ loaded: true });
  }

  render() {
    const { loaded } = this.state;
    if (!loaded) return <AppLoading />;
    return (
      <Provider store={Store}>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </Provider>
    );
  }
}
