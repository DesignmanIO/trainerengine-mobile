import React, { Component } from 'react';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import Icon from '@expo/vector-icons/AntDesign';
import Meteor, { withTracker } from 'react-native-meteor';
import { View } from 'react-native';
import hoistStatics from 'hoist-non-react-statics';

class Messages extends Component {
  static navigationOptions = {
    title: 'Messages',
    tabBarIcon: ({ tintColor }) => <Icon name="message1" size={20} color={tintColor} />,
  };

  constructor(props) {
    super(props);
    this.state = {
      messages: [],
    };
    this.onSend = this.onSend.bind(this);
  }

  componentWillMount() {
    this.setState({
      messages: [
        {
          _id: 1,
          text: 'Hello developer',
          createdAt: new Date(Date.UTC(2016, 7, 30, 17, 20, 0)),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://facebook.github.io/react/img/logo_og.png',
          },
        },
      ],
    });
  }
  onSend(messages = []) {
    this.setState(previousState => {
      return {
        messages: GiftedChat.append(previousState.messages, messages),
      };
    });
  }
  render() {
    const { style, messages, messagesHandle } = this.props;
    // return <View />;
    console.log(messages, messagesHandle.ready());
    return (
      <GiftedChat
        messages={messages.map(message => ({
          text: message.message,
          ...message,
        }))}
        onSend={this.onSend}
        user={{ _id: 1 }}
        renderBubble={props => {
          // console.log('props', props);
          return <Bubble {...props} />;
        }}
      />
    );
  }
}

export default hoistStatics(
  withTracker(() => {
    const messagesHandle = Meteor.subscribe('myMessages');
    const myDataHandle = Meteor.subscribe('myData');
    const messages = Meteor.collection('messages').find();
    return {
      messagesHandle,
      messages,
      myDataHandle,
    };
  })(Messages),
  Messages,
);
