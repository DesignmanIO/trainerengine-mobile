import React from 'react';
import {View, Row, TouchableOpacity} from '@shoutem/ui';
import {Text} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {navigationOptions} from '../../Config/Theme';
import {auth} from '../../api';

const More = (props) => {
  return (
    <View>
      <TouchableOpacity  onPress={() => auth.logout()}>
      <Row>
        <Text>Log Out</Text>
      </Row>
      </TouchableOpacity>
    </View>
  )
};

More.navigationOptions = {
  ...navigationOptions,
  title: "More",
  tabBarIcon: ({tintColor}) => (
    <Icon name="ios-more-outline" size={20} color={tintColor} />
  ),
};

export default More;
