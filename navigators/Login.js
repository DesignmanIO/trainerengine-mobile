import React, { Component } from 'react';
import { View, TextInput, Text, Button } from '@shoutem/ui';

import { renderIf } from '~/utils';
import Store, {actions} from '../redux';

class Login extends Component {
  static navigationOptions = {
    title: 'Log In',
  };

  constructor(props) {
    super(props);

    this.state = {
      loggingIn: false,
      email: '',
      password: '',
      // vs logging in
      createAccount: false,
      hidePassword: true,
    };
  }

  logIn() {
    this.setState({ loggingIn: true })
    Store.dispatch(actions.setAuthToken('asdf'));
  }

  render() {
    const {
      email,
      password,
      confirmPassword,
      loggingIn,
      createAccount,
      hidePassword,
    } = this.state;

    return (
      <View styleName="flexible vertical stretch space-around md-gutter-horizontal">
        <View styleName="stretch">
          <TextInput
            placeholder="Email"
            styleName="sm-gutter-bottom"
            value={email}
            onChangeText={text => this.setState({ email: text })}
          />
          <TextInput
            placeholder="Password"
            styleName="sm-gutter-bottom"
            value={password}
            onChangeText={text => this.setState({ password: text })}
            secureTextEntry={hidePassword}
          />
          {renderIf.if(createAccount)(<TextInput
              placeholder="Confirm Password"
              styleName="sm-gutter-bottom"
              value={confirmPassword}
              onChangeText={text => this.setState({ confirmPassword: text })}
              secureTextEntry={hidePassword}
            />,
          )()}
          <Text onPress={() => this.setState({ hidePassword: !hidePassword })}>
            {`${hidePassword ? 'Show' : 'Hide'} password`}
          </Text>
        </View>
        <View>
          <Button
            onPress={() => this.logIn()}
            styleName="sm-gutter-bottom"
          >
            <Text>Log In</Text>
          </Button>
          <Text
            onPress={() => this.setState({ createAccount: !createAccount })}
          >
            Or register
          </Text>
        </View>
      </View>
    );
  }
}

export default Login;
