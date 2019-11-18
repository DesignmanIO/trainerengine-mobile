import React from 'react';
import { connect } from 'react-redux';

import LoggedInNavigator from './LoggedInNavigator';
import LoggedOutNavigator from './LoggedOutNavigator';

const InitialRoute = ({ userState }) => (userState.authToken ? <LoggedInNavigator /> : <LoggedOutNavigator />);

export default connect(({ userState }) => ({ userState }))(InitialRoute);
