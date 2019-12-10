import C from './actionTypes';
export function sendMessage({ pubnub, channel, message }) {
  return dispatch => {
    dispatch({ type: C.SEND_MESSAGE, payload: message });
    pubnub.publish({
      channel,
      message
    });
  };
}

export function removeMessage({ messageId }) {
  return { type: C.REMOVE_MESSAGE, payload: messageId };
}

export function getMessages({}) {
  return dispatch => {
    // 1. get messages
    // 2. save to redux
    // 3. return messages
  };
}
