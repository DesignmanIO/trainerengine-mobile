const addMessage = db => ({ text, userId, channelId, imageUrl, createdAt, messageId }) => {
  db.transaction(tx =>
    tx.executeSql(
      'insert into messages (message, from_id, channel_id, image_url, created_at, external_id) values (?, ?, ?, ?, ?)',
      [text, userId, channelId, imageUrl, +new Date(createdAt), messageId],
    ),
  );
};

const removeMessage = db => ({ messageId }) => {
  db.transaction(tx => tx.executeSql('delete from messages where external_id = ?', [messageId]));
};

const databaseActions = db => ({
  addMessage: addMessage(db),
  removeMessage: removeMessage(db),
});

export default databaseActions;
