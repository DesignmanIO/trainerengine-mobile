import React from 'react';
import Meteor, { withTracker } from 'react-native-meteor';

import PubNubContext from './PubNubContext';

const PubNubProvider = ({ user, children, pubnub }) => (
  <PubNubContext.Provider value={pubnub}>{children}</PubNubContext.Provider>
);

export default withTracker(() => ({ user: Meteor.user() }))(PubNubProvider);
