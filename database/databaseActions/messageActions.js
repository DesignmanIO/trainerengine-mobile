const addMessage = db => ({ text, userId, channelId, imageUrl, createdAt, messageId }) =>
  db.transaction(tx =>
    tx.executeSql(
      'insert into messages (message, user_id, channel_id, image_url, created_at, message_id) values (?, ?, ?, ?, ?)',
      [text, userId, channelId, imageUrl, +new Date(createdAt), messageId]
    )
  );

const removeMessage = db => ({ messageId }) =>
  db.transaction(tx => tx.executeSql('delete from messages where message_id = ?', [messageId]));

const getMessagesByChannel = db => ({ channelId }) =>
  db.transaction(tx => tx.executeSql('select from messages where channel_id = ?', [channelId]));

const messageActions = db => ({
  addMessage: addMessage(db),
  removeMessage: removeMessage(db),
  getMessagesByChannel: getMessagesByChannel(db)
});

export default messageActions;
