import React from 'react';
import { View, Row, TouchableOpacity } from '@shoutem/ui';
import { Text } from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';

import { navigationOptions } from '../../Config/Theme';
import { logout } from '../../api';
import Store from '~/redux';

const More = props => (
  <View>
    <TouchableOpacity onPress={() => logout()}>
      <Row>
        <Text>Log Out</Text>
      </Row>
    </TouchableOpacity>
  </View>
);

More.navigationOptions = () => {
  console.log(
    Store.getState().userState.authToken === 'asdf',
    Store.getState().userState.authToken === 'asdfx',
  );
  return {
    ...navigationOptions,
    title: 'More',
    tabBarIcon: ({ tintColor }) => (
      <Icon name="ios-more-outline" size={20} color={tintColor} />
    ),
    ...(Store.getState().userState.authToken === 'asdf'
      ? {
        tabBarButtonComponent: null,
      }
      : {}),
  };
};

export default connect(({ userState }) => ({ userState }))(More);
