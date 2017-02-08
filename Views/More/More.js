import React from 'react';
import {View, Row, ListView} from '@shoutem/ui';
import {Text} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {navigationOptions} from '../../Config/Theme';

const options = [
  {title: "Log out"},
];

const More = (props) => {
  return (
    <ListView
      data={options}
      renderRow={(row) => {
        return (
          <Row>
            <Text>{row.title}</Text>
          </Row>
        );
      }}/>
  )
};

More.navigationOptions = {
  ...navigationOptions,
  title: "More",
  tabBar: {
    icon: ({tintColor}) => {
    return <Icon name="ios-more-outline" size={20} style={{color: tintColor}} />;
    },
  }
};

export default More;
