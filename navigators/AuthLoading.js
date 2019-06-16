import React from 'react';
import Meteor, { withTracker } from 'react-native-meteor';
import { connect } from 'react-redux';
import { ActivityIndicator, View } from 'react-native';
import useTheme from '../Config/Theme';
import { Text } from '../Components';

const AuthLoading = ({
  loggingIn, navigation, userId, status,
}) => {
  const {
    flex, align, margin, text,
  } = useTheme();

  if (!loggingIn) {
    console.log('done logging in', userId);
    navigation.navigate(userId ? 'AppNavigator' : 'AuthNavigator');
  }

  return (
    <View style={[flex, align.middle, align.center]}>
      <ActivityIndicator color="black" size="large" />
      <Text style={[margin.md, text.subTitle, text.subtle]}>
        {status.connected ? 'Logging in...' : 'Connecting...'}
      </Text>
    </View>
  );
};

export default withTracker(() => ({
  userId: Meteor.userId(),
  status: Meteor.status(),
  loggingIn: Meteor.loggingIn(),
}))(AuthLoading);
