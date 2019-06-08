import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

import { navigationOptions } from '../../Config/Theme';
import Task from '../../Components/Task';
import Meteor, { withTracker, MeteorListView } from 'react-native-meteor';

class Tasks extends Component {
  static navigationOptions = {
    ...navigationOptions,
    title: 'Tasks',
    tabBarIcon: ({ tintColor }) => (
      <Icon name="ios-checkmark-circle-outline" size={20} color={tintColor} />
    ),
  };

  constructor(props) {
    super(props);

    this.state = {
      scrollEnabled: true,
    };
  }

  allowScroll = allowScroll => {
    this.setState({ scrollEnabled: allowScroll });
  };

  render() {
    console.log(this.props.tasks);
    return (
      <MeteorListView
        collection="tasks"
        selector={{ status: 'pending' }}
        options={{ sort: { createdAt: -1 } }}
        renderRow={task => (
          <Task key={`task-${task._id}`} task={task} allowScroll={this.allowScroll} />
        )}
      />
    );
  }
}

export default withTracker(() => {
  const myDataHandle = Meteor.subscribe('myData');
  const tasks = Meteor.collection('tasks').find();
  return { myDataHandle, tasks };
})(Tasks);
