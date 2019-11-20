const addUser = db => ({ userId, firstName, lastName, avatarUrl, createdAt }) =>
  db.transaction(tx => {
    tx.executeSql(
      'insert into users (user_id, first_name, last_name, avatar_url, created_at), values (?,?,?,?,?)',
      [userId, firstName, lastName, avatarUrl, createdAt]
    );
  });

const removeUser = db => ({ userId }) =>
  db.transaction(tx => {
    tx.executeSql('delete from channel_users where user_id = ?', [userId]);
    return tx.executeSql('delete from users where user_id = ?', [userId]);
  });

const addUserRelationship = db => ({ userId, otherUserId, type }) =>
  db.transaction(tx =>
    tx.executeSql(
      'insert into user_relationships (user_id, other_user_id, relationship_type) values (?,?,?)',
      userId,
      otherUserId,
      type
    )
  );

const addCoach = db => ({ userId, otherUserId }) =>
  addUserRelationship({ userId, otherUserId, type: 'coach' });

const addClient = db => ({ userId, otherUserId }) =>
  addUserRelationship({ userId, otherUserId, type: 'client' });

const removeUserRelationship = db => ({ userId, otherUserId, type }) =>
  db.transaction(tx =>
    tx.executeSql(
      'delete from user_relationships where user_id = ? and other_user_id = ? and type = ?',
      [userId, otherUserId, type]
    )
  );

const removeCoach = db => ({ userId, otherUserId }) =>
  removeUserRelationship({ userId, otherUserId, type: 'coach' });

const removeClient = db => ({ userId, otherUserId }) =>
  removeUserRelationship({ userId, otherUserId, type: 'client' });

const getUserRelationshipsByType = db => ({ userId, type }) =>
  db.transaction(tx =>
    tx.executeSql(
      `
  select users.* from users
  inner join user_relationships
  on users.user_id = user_relationships.user_id
  where user_relationships.user_id = ? and user_relationships.type = ?
  `,
      [userId, type]
    )
  );

const getCoaches = db => userId => getUserRelationshipsByType({ userId, type: 'coach' });

const getClients = db => userId => getUserRelationshipsByType({ userId, type: 'client' });

const userActions = db => ({
  addUser: addUser(db),
  removeUser: removeUser(db),
  addClient: addClient(db),
  addCoach: addCoach(db),
  removeClient: removeClient(db),
  removeCoach: removeCoach(db),
  getCoaches: getCoaches(db),
  getClients: getClients(db)
});

export default userActions;
