const appTypes = { REDUXREADY: 'READUXREADY' };
const userTypes = {
  SET_AUTHTOKEN: 'SET_AUTHTOKEN'
};
const messageTypes = {
  SEND_MESSAGE: 'SEND_MESSAGE',
  SET_MESSAGES: 'SET_MESSAGES',
  REMOVE_MESSAGE: 'REMOVE_MESSAGE'
};

const types = {
  ...messageTypes,
  ...appTypes,
  ...userTypes
};

export default types;
