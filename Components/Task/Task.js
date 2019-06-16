import React, { useState } from 'react';
import PropTypes from 'proptypes';
import Swipeout from 'react-native-swipeout';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import useTheme from '../../Config/Theme';

const Task = ({ task, onMarkComplete, allowScroll }) => {
  const [swiperOpen, toggleSwiperOpen] = useState(false);
  const {
    swipeout, text, debug, align,
  } = useTheme();

  const markComplete = () => {
    toggleSwiperOpen(true);
    setTimeout(() => {
      onMarkComplete(task._id);
      toggleSwiperOpen(false);
      console.log('complete');
    }, 300);
  };

  return (
    <Swipeout
      right={[
        {
          text: 'Complete',
          component: <Icon style={swipeout.icon} name="check-circle" size={20} />,
          backgroundColor: swipeout.backgroundColor,
        },
      ]}
      style={swipeout.container}
      scroll={event => allowScroll(event)}
      onOpen={() => markComplete()}
      close={!swiperOpen}
      autoClose
    >
      <View style={[swipeout.row, align.vertical, align.center, align.middle]}>
        <Text style={[text.subtle]}>{task.name}</Text>
      </View>
    </Swipeout>
  );
};

Task.propTypes = {
  task: PropTypes.object,
  style: PropTypes.object,
  allowScroll: PropTypes.func,
};

export default Task;
