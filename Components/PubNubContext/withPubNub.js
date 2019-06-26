import React from 'react';
import hoistStatics from 'hoist-non-react-statics';

import PubNubContext from './PubNubContext';

const withPubNub = WrappedComponent => hoistStatics(
  props => (
    <PubNubContext.Consumer>
      {pubNub => <WrappedComponent pubNub={pubNub} {...props} />}
    </PubNubContext.Consumer>
  ),
  WrappedComponent,
);

export default withPubNub;
