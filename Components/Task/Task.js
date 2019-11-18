import React, { Component, useState, useEffect } from 'react';
import PropTypes from 'proptypes';
import { View, Text } from 'react-native';
import Icon from '@expo/vector-icons/AntDesign';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { Easing } from 'react-native-reanimated';

import useTheme, { colors, withTheme } from '../../Config/Theme';

const {
  event, interpolate, State, call, debug, multiply,
} = Animated;

@withTheme
class Task extends Component {
  constructor(props) {
    super(props);

    this.CHECKMARK_WIDTH = 70;

    this.dragX = new Animated.Value(0);
    this.visible = new Animated.Value(1);
    this.onComplete = this.onComplete.bind(this);
  }

  markComplete() {
    const { onMarkComplete, task } = this.props;
    console.log('markComplete()');
    Animated.timing(this.visible, {
      toValue: 0,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    }).start();
    setTimeout(() => {
      onMarkComplete(task._id, task.status === 'done' ? 'pending' : 'done');
      console.log('complete');
    }, 300);
  }

  onComplete({
    nativeEvent: {
      contentOffset: { x },
    },
  }) {
    if (x === this.CHECKMARK_WIDTH) this.markComplete();
  }

  render() {
    const {
      task: { status, name, ...rest },
      theme,
    } = this.props;
    const {
      swipeout, text, align, position, flex, constants, padding, margin,
    } = theme;
    return (
      <Animated.View
        style={{
          height: interpolate(this.visible, {
            inputRange: [0, 1],
            outputRange: [0, this.CHECKMARK_WIDTH],
          }),
        }}
      >
        <Animated.ScrollView
          // scrollEnabled={status !== 'done'}
          onScroll={event([
            {
              nativeEvent: {
                contentOffset: { x: this.dragX },
              },
            },
          ])}
          onMomentumScrollEnd={this.onComplete}
          onScrollEndDrag={this.onComplete}
          contentContainerStyle={[
            {
              width: constants.deviceX + this.CHECKMARK_WIDTH,
            },
            align.center,
            align.middle,
          ]}
          snapToOffsets={[constants.deviceX, constants.deviceX + this.CHECKMARK_WIDTH]}
          decelerationRate="slow"
          scrollEventThrottle={16}
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          bounces={false}
          horizontal
        >
          {/* <Animated.Code>{() => debug('asdf', this.dragX)}</Animated.Code> */}
          <Animated.View
            style={[
              swipeout.row,
              align.horizontal,
              align.center,
              align.middle,
              flex,
              { transform: [{ scale: this.visible }], opacity: this.visible },
            ]}
          >
            <Animated.View
              style={[
                position.absoluteFill,
                {
                  borderWidth: 0.5,
                  borderColor: colors.grey,
                  opacity: interpolate(multiply(this.dragX, this.visible), {
                    inputRange: [0, this.CHECKMARK_WIDTH],
                    outputRange: [0, 1],
                  }),
                },
              ]}
            />
            <Text
              style={[
                text.subtle,
                text.subtitle,
                margin.left.lg,
                flex,
                status === 'done' ? text.strikethrough : {},
                // { width: constants.deviceX },
              ]}
            >
              {name}
            </Text>
            <Animated.View
              style={{
                backgroundColor: swipeout.backgroundColor,
                width: this.CHECKMARK_WIDTH,
                height: interpolate(this.visible, {
                  inputRange: [0, 1],
                  outputRange: [0, this.CHECKMARK_WIDTH],
                }),
              }}
            >
              <Icon style={swipeout.icon} name="checkcircleo" size={15} />
            </Animated.View>
          </Animated.View>
        </Animated.ScrollView>
      </Animated.View>
    );
  }
}

Task.propTypes = {
  task: PropTypes.object,
  style: PropTypes.object,
  allowScroll: PropTypes.func,
};

export default Task;
