import Meteor from 'react-native-meteor';

const auth = {
  logout() {
    Meteor.logout();
  },
}

export default auth;