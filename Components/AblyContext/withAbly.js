import React, { useState, useEffect } from 'react';
import hoistStatics from 'hoist-non-react-statics';

import AblyContext from './AblyContext';

const AblyComponent = ({ Ably, Component, channelName }) => {
  const [messages, setMessages] = useState([]);
  const addMessages = (msgs = []) => setMessages([...messages, ...msgs]);
  const channel = Ably.channels.get(channelName);
  useEffect(() => {
    const listener = channel.subscribe(msg => {
      addMessages([msg]);
    });
    return () => {
      channel.unsubscribe(listener);
    };
  });
  Ably.postMessage = ({ message }) => channel.publish('message', { message });
  // look here: https://www.ably.io/documentation/realtime/messages#message-history
  let nextPage; let
    prevPage;
  const getMessageHistory = () => {
    channel.attach();
    channel.once('attached', () => {
      const getHistoryPage = (err, {
        items, next, first, hasNext,
      }) => {
        if (err) {
          console.log('Error');
          return false;
        }
        addMessages(items);
        if (!hasNext()) {
          console.log('No next page');
          return false;
        }
        nextPage = next(getHistoryPage);
      };
      channel.history(getHistoryPage);
    });
  };
  return (
    <Component {...{
      Ably,
      messages,
      getMessageHistory,
      presence: channel.presence,
      nextPage,
    }}
    />
  );
};

const withAbly = ({ subscribe }) => WrappedComponent => hoistStatics(
  props => (
    <AblyContext.Consumer>
      {Ably => (
        <AblyComponent
          Component={WrappedComponent}
          Ably={Ably}
          subscribe={subscribe}
          {...props}
        />
      )}
    </AblyContext.Consumer>
  ),
  WrappedComponent,
);

export default withAbly;
