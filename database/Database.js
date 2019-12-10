import { SQLite } from 'expo-sqlite';

import dbDefinitions from './databaseDefinitions';
import messageActions from './databaseActions/messageActions';
import channelActions from './databaseActions/channelActions';
import userActions from './databaseActions/userActions';

class DB {
  constructor() {
    this.db = false;
  }

  async open() {
    this.db = SQLite.openDatabase('db');
    await new Promise(r =>
      this.db.transaction(
        tx => dbDefinitions(tx),
        err => {
          console.log('db err', err);
          r(false);
        },
        res => {
          console.log('db res', res);
          r(true);
        }
      )
    );
    this.messages = messageActions(this.db);
    this.channels = channelActions(this.db);
    this.users = userActions(this.db);
    return true;
  }

  close() {
    this.db.close();
  }
}

instance = new DB();

export default instance;
