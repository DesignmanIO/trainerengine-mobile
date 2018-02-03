import React, {Component} from 'react';
import {View} from '@shoutem/ui';
import Icon from 'react-native-vector-icons/Ionicons';
import {ListView} from '@shoutem/ui';

import {navigationOptions} from '../../Config/Theme';
import Task from '../../Components/Task';

class Tasks extends Component{
  static navigationOptions = {
    ...navigationOptions,
    title: "Tasks",
    tabBarIcon: ({tintColor}) => (
      <Icon name="ios-checkmark-circle-outline" size={20} color={tintColor}/>
    ),
  }

  constructor(props) {
    super(props);

    this.state = {
      scrollEnabled: true,
    };
  }

  allowScroll = (allowScroll) => {
    this.setState({scrollEnabled: allowScroll});
  }

  render() {
    return (
      <ListView
        data={[{title: 'tasktitle', _id: 1}]}
        renderRow={(task) => <Task key={`task-${task._id}`} task={task} allowScroll={this.allowScroll}/>}
        scrollEnabled={this.state.scrollEnabled}
      />
    )
  }
}

export default Tasks;
