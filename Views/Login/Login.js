import {Component} from 'react';
import {View, TextInput} from '@shoutem/ui';

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loggingIn: false,
      email: '',
      password: '',
      hidePassword: true,
    };
  }

  render() {
    const {email, password, hidePassword} = this.state;
    return (
      <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={text => this.setState({email: text})}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={text => this.setState({password: text})}
        secureTextEntry={hidePassword}
      />
    </View>
      )
  }
}

export default Login;