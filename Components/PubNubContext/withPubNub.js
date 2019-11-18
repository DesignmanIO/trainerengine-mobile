import React, { useState, useEffect } from 'react';
import hoistStatics from 'hoist-non-react-statics';

import PubNubContext from './PubNubContext';

const PubNubComponent = ({ pubnub, Component, subscribe, ...props }) => {
  const [messages, setMessages] = useState([]);
  const addMessages = m => setMessages([...messages, ...m]);
  useEffect(() => {
    const listener = pubnub.addListener({
      status(status) {
        // what does this do?
        console.log(status);
      },
      message(message) {
        addMessages([message]);
      },
      presence(presence) {
        // what does this do?
        console.log(presence);
      },
    });
    pubnub.subscribe(subscribe);
    pubnub.removeListener(listener);
    return () => {
      pubnub.unsubscribe(subscribe);
    };
  });
  const { publish } = pubnub;
  return <Component {...props} pubnub={pubnub} messages={messages} publish={publish} />;
};

const withPubNub = ({ subscribe }) => WrappedComponent =>
  hoistStatics(
    props => (
      <PubNubContext.Consumer>
        {pubnub => (
          <PubNubComponent
            {...props}
            Component={WrappedComponent}
            pubnub={pubnub}
            subscribe={subscribe}
          />
        )}
      </PubNubContext.Consumer>
    ),
    WrappedComponent,
  );

export default withPubNub;
