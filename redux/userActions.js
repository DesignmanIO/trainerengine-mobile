import Meteor from 'react-native-meteor';
import C from './actionTypes';

const userActions = {
  logIn({ email, password }) {
    return async dispatch => {
      const result = await new Promise(resolve =>
        Meteor.loginWithPassword(email, password, (err, res) =>
          resolve(err, res)
        )
      );
      console.log('logIn', email, password, result);
      dispatch({ type: 'NA' });
      return true;
    };
  },
  logOut() {
    return { type: C.SET_AUTHTOKEN, payload: '' };
  },
  setAuthToken(token = '') {
    return { type: C.SET_AUTHTOKEN, payload: token };
  },
};

export default userActions;
