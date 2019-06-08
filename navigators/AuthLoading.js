import React, { Component, useEffect } from 'react';
import Meteor, { withTracker } from 'react-native-meteor';
import { connect } from 'react-redux';
import { Spinner, View } from 'react-native';

const AuthLoading = ({ loggingIn, navigation, userId }) => {
  if (!loggingIn) {
    navigation.navigate(userId ? 'AppNavigator' : 'AuthNavigator');
  }

  return (
    <View styleName="flexible vertical h-center v-center">
      <Spinner style={{ color: 'black', size: 'large' }} />
    </View>
  );
};

export default withTracker(() => ({
  userId: Meteor.userId(),
  status: Meteor.status(),
  loggingIn: Meteor.loggingIn(),
}))(AuthLoading);
