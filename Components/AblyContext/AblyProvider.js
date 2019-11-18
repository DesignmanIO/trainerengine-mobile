import React from 'react';
import Meteor, { withTracker } from 'react-native-meteor';

import AblyContext from './AblyContext';

const AblyProvider = ({ user, children, ably }) => (
  <AblyContext.Provider value={ably}>{children}</AblyContext.Provider>
);

export default withTracker(() => ({ user: Meteor.user() }))(AblyProvider);
