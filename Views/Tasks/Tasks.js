import React, { Component } from 'react';
import Icon from '@expo/vector-icons/AntDesign';
import hoistStatics from 'hoist-non-react-statics';
import { SectionList, Text } from 'react-native';
import _ from 'lodash';

// import { navigationOptions } from '../../Config/Theme';
import Meteor, { withTracker, MeteorListView } from 'react-native-meteor';
import Task from '../../Components/Task';
import { withTheme } from '../../Config/Theme';

class Tasks extends Component {
  static navigationOptions = {
    title: 'Tasks',
    tabBarIcon: ({ tintColor }) => <Icon name="checkcircleo" size={20} color={tintColor} />,
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
    const {
      tasks,
      theme: { text, margin },
    } = this.props;
    const taskSections = tasks.reduce((arr, task) => {
      const statusIndex = arr.findIndex(s => s.title === task.status);
      if (statusIndex < 0) return [...arr, { title: task.status, data: [task] }];
      arr[statusIndex].data.push(task);
      return arr;
    }, []).sort((s1, s2) => (s1 > s2 ? 1 : -1));
    // console.log(this.props.tasks);
    return (
      <SectionList
        sections={taskSections}
        listViewRef={SectionList}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={[text.title, text.subtle, margin.left.lg, margin.top.lg]}>{_.startCase(title)}</Text>
        )}
        renderItem={({ item: task }) => (
          <Task
            key={`task-${task._id}`}
            task={task}
            allowScroll={this.allowScroll}
            onMarkComplete={(taskId, status = 'done') => {
              Meteor.call('updateTaskStatus', taskId, status);
            }}
          />
        )}
      />
    );
  }
}

export default hoistStatics(
  withTheme(
    withTracker(() => {
      const myDataHandle = Meteor.subscribe('myData');
      const tasks = Meteor.collection('tasks').find();
      return { myDataHandle, tasks };
    })(Tasks),
  ),
  Tasks,
);
