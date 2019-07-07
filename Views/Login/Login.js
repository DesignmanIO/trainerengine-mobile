import React, { Component } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';

import { Text, TextInput } from '../../Components';
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
    const { email, password, confirmPassword, createAccount, hidePassword } = this.state;
    const {
      theme: { image, margin, align, flex, button },
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
          />
          <TextInput
            placeholder="Password"
            style={margin.bottom.sm}
            value={password}
            onChangeText={text => this.setState({ password: text })}
            secureTextEntry={hidePassword}
          />
          {renderIf.if(createAccount)(
            <TextInput
              placeholder="Confirm Password"
              style={margin.bottom.sm}
              value={confirmPassword}
              onChangeText={text => this.setState({ confirmPassword: text })}
              secureTextEntry={hidePassword}
            />,
          )()}
          <TouchableOpacity onPress={() => this.setState({ hidePassword: !hidePassword })}>
            <Text>{`${hidePassword ? 'Show' : 'Hide'} password`}</Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            style={[button.defaultStyle, margin.bottom.sm]}
            onPress={() => (createAccount ? this.createAccount() : this.logIn())}
            styleName="sm-gutter-bottom"
          >
            <Text style={button.text}>{createAccount ? 'Create Account' : 'Log In'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[button.defaultStyle]}
            onPress={() => this.setState({ createAccount: !createAccount })}
          >
            <Text style={button.text}>{createAccount ? 'Or log in' : 'Or register'}</Text>
          </TouchableOpacity>
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
