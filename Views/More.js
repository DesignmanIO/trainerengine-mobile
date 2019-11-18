import React from 'react';
import { View } from 'react-native';
import { DrawerActions } from 'react-navigation';
import { connect } from 'react-redux';
import Icon from '@expo/vector-icons/AntDesign';

// import { navigationOptions } from '../../Config/Theme';
import Store, { userActions } from '../redux';

const More = View;

More.navigationOptions = () => {
  console.log(
    Store.getState().userState.authToken === 'asdf',
    Store.getState().userState.authToken === 'asdfx',
  );
  return {
    // ...navigationOptions,
    title: 'More',
    tabBarIcon: ({ tintColor }) => <Icon name="ellipsis1" size={20} color={tintColor} />,
    tabBarOnPress({ navigation, defaultHandler }) {
      navigation.dispatch(DrawerActions.openDrawer());
    },
    ...(Store.getState().userState.authToken === 'asdf'
      ? {
        tabBarButtonComponent: null,
      }
      : {}),
  };
};

export default connect(
  ({ userState }) => ({ userState }),
  { logOut: userActions.logOut },
)(More);
