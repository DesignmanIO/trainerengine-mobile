import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Spinner, View } from '@shoutem/ui';

class AuthLoading extends Component {
  constructor(props) {
    super(props);

    this.navigateNext();
    this.navigateNext = this.navigateNext.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.userState !== nextProps.userState) {
      this.navigateNext();
    }
  }

  navigateNext() {
    const { navigation, userState } = this.props;

    navigation.navigate(userState.authSettings && userState.authToken
      ? 'AppNavigator'
      : 'AuthNavigator');
    // navigation.navigate('Auth');
  }

  render() {
    return (
      <View styleName="flexible vertical h-center v-center">
        <Spinner style={{ color: 'white', size: 'large' }} />
      </View>
    );
  }
}

export default connect(({ userState }) => ({ userState }))(AuthLoading);
