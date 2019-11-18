import Meteor, { Accounts } from 'react-native-meteor';
import { Alert } from 'react-native';

import { NavigationService } from '../utils';
import C from './actionTypes';

const userActions = {
  logIn({ email, password }) {
    return async dispatch => {
      const result = await new Promise(resolve => Meteor.loginWithPassword(email, password, (err, res) => resolve(err, res)));
      console.log('logIn', email, password, result);
      if (result && result.error) {
        Alert.alert('Login Error', result.reason);
        return false;
      }
      // dispatch({ type: 'NA' });
      return true;
    };
  },
  createAccount({ email, password, confirmPassword }) {
    return async dispatch => {
      if (password !== confirmPassword) {
        Alert.alert("Passwords don't match");
        return false;
      }
      const result = await new Promise(resolve => Accounts.createUser({ email, password }, (err, res) => resolve(err, res)));
      if (result && result.error) {
        Alert.alert('Sorry...', result.reason);
        return false;
      }
      return true;
    };
  },
  logOut() {
    console.log('logOut');
    Meteor.logout();
    NavigationService.navigate('Login');
    return { type: C.SET_AUTHTOKEN, payload: '' };
  },
  setAuthToken(token = '') {
    return { type: C.SET_AUTHTOKEN, payload: token };
  },
};

export default userActions;
