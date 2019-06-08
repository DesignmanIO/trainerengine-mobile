import React, { Component } from 'react';
import PropTypes from 'proptypes';
import Swipeout from 'react-native-swipeout';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

class Task extends Component {
  constructor(props) {
    super(props);

    this.state = {
      swiperOpen: false,
    };
  }

  markComplete = () => {
    this.setState({ swiperOpen: true });
    setTimeout(() => {
      this.setState({ swiperOpen: false });
      console.log('complete');
    }, 300);
  };

  render() {
    const { task, style, allowScroll } = this.props;
    return (
      <Swipeout
        right={[
          {
            text: 'Complete',
            component: (
              <Icon style={style.swipeoutIcon} name="ios-checkmark-circle-outline" size={20} />
            ),
            backgroundColor: style.swipeout.backgroundColor,
          },
        ]}
        style={style.swipeoutContainer}
        scroll={event => allowScroll(event)}
        onOpen={this.markComplete}
        close={!this.state.swiperOpen}
        autoClose
      >
        <View style={style.taskRow}>
          <Text>{task.title}</Text>
        </View>
      </Swipeout>
    );
  }
}

Task.propTypes = {
  task: PropTypes.object,
  style: PropTypes.object,
  allowScroll: PropTypes.func,
};

export default Task;
