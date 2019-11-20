const addChannel = db => ({ name, channelId, createdAt }) =>
  db.transaction(tx =>
    tx.executeSql('insert into channels (name, channel_id, created_at) values (?, ?, ?, ?, ?)', [
      name,
      channelId,
      +new Date(createdAt)
    ])
  );

const removeChannel = db => ({ channelId }) =>
  db.transaction(tx => {
    tx.executeSql('delete from channel_users where channel_id = ?', [channelId]);
    return tx.executeSql('delete from channels where channel_id = ?', [channelId]);
  });

const addUserToChannel = db => ({ userId, channelId }) =>
  db.transaction(tx =>
    tx.executeSql('insert into channel_users (user_id, channel_id) values (?, ?)', [
      userId,
      channelId
    ])
  );

const addUsersToChannel = db => ({ userIds, channelId }) =>
  userIds.forEach(userId => addUserToChannel(db)({ userId, channelId }));

const removeUserFromChannel = db => ({ userId, channelId }) =>
  db.transaction(tx =>
    tx.executeSql('delete from channel_users where channel_id = ? and user_id = ?', [
      channelId,
      userId
    ])
  );

const getUserChannels = db => ({ userId }) =>
  db.transaction(tx =>
    tx.executeSql(
      `
      select channels.* from channels
      inner join channel_users
      on channels.channel_id = channel_users.channel_id
      where channel_users.user_id = ?
  `,
      [userId]
    )
  );

const channelActions = db => ({
  addChannel: addChannel(db),
  removeChannel: removeChannel(db),
  addUsersToChannel: addUsersToChannel(db),
  removeUserFromChannel: removeUserFromChannel(db),
  getUserChannels: getUserChannels(db)
});

export default channelActions;
