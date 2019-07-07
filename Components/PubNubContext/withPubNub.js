import React, { useState, useEffect } from 'react';
import hoistStatics from 'hoist-non-react-statics';

import PubNubContext from './PubNubContext';

const withPubNub = ({ subscribe }) => WrappedComponent => hoistStatics(
  props => (
    <PubNubContext.Consumer>
      {pubNub => {
        const [messages, addMessage] = useState([]);
        useEffect(() => {
          const listener = pubNub.addListener({
            status(status) {
              // what does this do?
              console.log(status);
            },
            message(message) {
              addMessage(message);
            },
            presence(presence) {
              // what does this do?
              console.log(presence)
            },
          });
          pubNub.subscribe(subscribe);
          pubNub.removeListener(listener);
          return () => {
            pubNub.unsubscribe(subscribe);
          };
        });
        return <WrappedComponent messages={messages} pubNub={pubNub} {...props} />}}
    </PubNubContext.Consumer>
  ),
  WrappedComponent,
);

export default withPubNub;
