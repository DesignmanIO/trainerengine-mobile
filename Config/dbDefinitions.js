const dbDefinitions = tx => {
  tx.executeSql(
    `create table if not exists messages (
    id integer primary key not null,
    external_id text,
    created_at int,
    from_id text,
    message text,
    image_url text,
    channel_id int
    FOREIGN KEY(channel_id) REFERENCES channels(id)
    );`,
  );
  tx.executeSql(
    `create table if not exists channels (
    id integer primary key not null,
    external_id text,
    created_at int,
    name text
    );`,
  );
  tx.executeSql(
    `create table if not exists channel_users (
        id integer primary key not null,
        user_id int,
        channel_id int,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(channel_id) REFERENCES channels(id)
        );`,
  );
  tx.executeSql(
    `create table if not exists users (
    id integer primary key not null,
    external_id text,
    created_at int,
    user_id int,
    foreign key(user_id) references channels(id)
    );`,
  );
  tx.executeSql(`CREATE INDEX id_index on messages (external_id)`);
};

export default dbDefinitions;
