import React, { Component } from 'react';
import { View, TextInput, Text, Button } from '@shoutem/ui';
import { connect } from 'react-redux';

import { renderIf } from '~/utils';
import Store, { userActions } from '~/redux';

@connect(
  null,
  { logIn: userActions.logIn }
)
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
    const { email, password } = this.state;
    this.setState({ loggingIn: true });
    this.props.logIn({ email, password });
    this.props.navigation.navigate('AuthLoading');
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
          {renderIf.if(createAccount)(
            <TextInput
              placeholder="Confirm Password"
              styleName="sm-gutter-bottom"
              value={confirmPassword}
              onChangeText={text => this.setState({ confirmPassword: text })}
              secureTextEntry={hidePassword}
            />
          )()}
          <Button
            onPress={() => this.setState({ hidePassword: !hidePassword })}
          >
            <Text>{`${hidePassword ? 'Show' : 'Hide'} password`}</Text>
          </Button>
        </View>
        <View>
          <Button onPress={() => this.logIn()} styleName="sm-gutter-bottom">
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
