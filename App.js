import Expo, { AppLoading } from "expo";
import React, { Component } from "react";
import { StyleProvider } from "@shoutem/theme";
import Meteor from "react-native-meteor";
import { Provider } from "react-redux";

import Theme, { colors } from "./Config/Theme";
import RootNavigator from "./navigators/RootNavigator";
import Store from "./redux";
import startup from "./startup";

// Meteor.connect("wss://app.trainerengine.com/websocket");
Meteor.connect("ws://localhost:3000/websocket");

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false
    };
  }
  async componentWillMount() {
    await startup();
    this.setState({ loaded: true });
  }
  render() {
    if (!this.state.loaded) return <AppLoading />;
    return (
      <Provider store={Store}>
        <StyleProvider style={Theme}>
          <RootNavigator />
        </StyleProvider>
      </Provider>
    );
  }
}
