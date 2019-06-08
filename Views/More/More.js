import React from 'react';
import { View, TouchableOpacity, Button } from 'react-native';
import { Text } from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';

import { navigationOptions } from '../../Config/Theme';
import Store, { userActions } from '~/redux';

const More = ({ logOut }) => (
  <View>
    <Button onPress={() => logOut()}>
      <Text>Log Out</Text>
    </Button>
  </View>
);

More.navigationOptions = () => {
  console.log(
    Store.getState().userState.authToken === 'asdf',
    Store.getState().userState.authToken === 'asdfx'
  );
  return {
    ...navigationOptions,
    title: 'More',
    tabBarIcon: ({ tintColor }) => (
      <Icon name="ios-more" size={20} color={tintColor} />
    ),
    ...(Store.getState().userState.authToken === 'asdf'
      ? {
          tabBarButtonComponent: null,
        }
      : {}),
  };
};

export default connect(
  ({ userState }) => ({ userState }),
  { logOut: userActions.logOut }
)(More);
