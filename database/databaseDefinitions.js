const databaseDefinitions = tx => {
  tx.executeSql(
    `create table if not exists messages (
    id integer primary key not null,
    message_id text,
    created_at int,
    user_id text,
    message text,
    image_url text,
    channel_id int
    foreign key(channel_id) references channels(id)
    );`
  );
  tx.executeSql(
    `create table if not exists channels (
    id integer primary key not null,
    channel_id text,
    created_at int,
    name text
    );`
  );
  tx.executeSql(
    `create table if not exists channel_users (
    id integer primary key not null,
    user_id int,
    channel_id int,
    foreign key(user_id) references users(id),
      on delete cascade
    foreign key(channel_id) references channels(id)
      on delete cascade
    );`
  );
  tx.executeSql(
    `create table if not exists users (
    id integer primary key not null,
    user_id text,
    first_name text,
    last_name text,
    avatar_url text,
    created_at int,
    );`
  );
  tx.executeSql(
    `create table if not exists user_relationships (
    id integer primary key not null,
    user_id text,
    other_user_id text,
    relationship_type text,
    foreign key(user_id) references users(id)
      ON DELETE CASCADE
    foreign key(other_user_id) references users(id)
      ON DELETE CASCADE
    );`
  );
  tx.executeSql(`CREATE INDEX message_id_index on messages(message_id)`);
};

export default databaseDefinitions;
