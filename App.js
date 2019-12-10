import Expo, { AppLoading } from 'expo';
import React, { Component } from 'react';
import Meteor from 'react-native-meteor';
import { Provider } from 'react-redux';
import { PubNubProvider } from 'pubnub-react';

import { AblyProvider } from './Components/AblyContext';
import Theme, { colors, ThemeProvider } from './Config/Theme';
import RootNavigator from './navigators/RootNavigator';
import store from './redux';
import startup from './startup';
// import { PubNubProvider } from './Components/PubNubContext';
import { NavigationService } from './utils';
import { DatabaseProvider } from './Components/DatabaseContext';
// Meteor.connect("wss://app.coachfulness.app/websocket");

export default class App extends Component {
  constructor() {
    super();

    this.pubnub = null;

    this.state = {
      loaded: false
    };
  }

  async componentDidMount() {
    const { pubnub } = await startup();
    this.pubnub = pubnub;
    this.setState({ loaded: true });
  }

  render() {
    const { loaded } = this.state;
    if (!loaded) return <AppLoading />;
    return (
      <Provider store={store}>
        <PubNubProvider client={this.pubnub}>
          <ThemeProvider>
            <RootNavigator ref={c => NavigationService.setTopLevelNavigator(c)} />
          </ThemeProvider>
        </PubNubProvider>
      </Provider>
    );
  }
}
