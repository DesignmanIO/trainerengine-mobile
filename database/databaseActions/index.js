import userActions from './userActions';
import messageActions from './messageActions';
import channelActions from './channelActions';

const databaseActions = db => ({
  ...userActions(db),
  ...messageActions(db),
  ...channelActions(db)
});

export default databaseActions;
