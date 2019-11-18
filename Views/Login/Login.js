import React, { Component } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';

import { Text, TextInput, Button } from '../../Components';
import { renderIf } from '../../utils';
import { userActions } from '../../redux';
import images from '../../assets/images';
import { withTheme } from '../../Config/Theme';

class Login extends Component {
  static navigationOptions = {
    title: 'Log In',
    headerMode: 'none',
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

  async logIn() {
    const { email, password } = this.state;
    this.setState({ loggingIn: true });
    const loggedIn = await this.props.logIn({ email, password });
    if (loggedIn) {
      this.props.navigation.navigate('AuthLoading');
    }
  }

  async createAccount() {
    const { email, password, confirmPassword } = this.state;
    this.setState({ loggingIn: true });
    const loggedIn = await this.props.createAccount({ email, password, confirmPassword });
    if (loggedIn) {
      this.props.navigation.navigate('AuthLoading');
    }
  }

  render() {
    const {
      email, password, confirmPassword, createAccount, hidePassword,
    } = this.state;
    const {
      theme: {
        image, margin, align, flex, button,
      },
    } = this.props;

    return (
      <View style={[flex, align.between, margin.lg]}>
        <Image source={images.logoVertical} style={[image.fill, { height: 300 }]} />
        <View style={[align.stretch, margin.v.sm]}>
          <TextInput
            placeholder="Email"
            style={margin.bottom.sm}
            value={email}
            onChangeText={text => this.setState({ email: text })}
            onSubmitEditing={() => this.password.focus()}
            returnKeyType="next"
          />
          <TextInput
            placeholder="Password"
            style={margin.bottom.sm}
            value={password}
            inputRef={c => this.password = c}
            onChangeText={text => this.setState({ password: text })}
            onSubmitEditing={() => (createAccount ? this.confirmPassword.focus() : this.logIn())}
            secureTextEntry={hidePassword}
            returnKeyType={createAccount ? 'next' : 'done'}
          />
          {renderIf.if(createAccount)(
            <TextInput
              placeholder="Confirm Password"
              inputRef={c => this.confirmPassword = c}
              style={margin.bottom.sm}
              value={confirmPassword}
              onChangeText={text => this.setState({ confirmPassword: text })}
              secureTextEntry={hidePassword}
              onSubmitEditing={this.createAccount}
              returnKeyType="done"
            />,
          )()}
          <Button
            onPress={() => this.setState({ hidePassword: !hidePassword })}
            text={`${hidePassword ? 'Show' : 'Hide'} password`}
            type="blank"
          />
        </View>
        <View>
          <Button
            style={margin.bottom.sm}
            onPress={() => (createAccount ? this.createAccount() : this.logIn())}
            text={createAccount ? 'Create Account' : 'Log In'}
            type="primary"
          />
          <Button
            style={[button.defaultStyle]}
            onPress={() => this.setState({ createAccount: !createAccount })}
            text={createAccount ? 'Or log in' : 'Or register'}
            type="secondary"
          />
        </View>
      </View>
    );
  }
}

export default withTheme(
  connect(
    null,
    { logIn: userActions.logIn, createAccount: userActions.createAccount },
  )(Login),
);
