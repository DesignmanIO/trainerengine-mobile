import React, { Component } from 'react';
import { GiftedChat, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
import Icon from '@expo/vector-icons/AntDesign';
import FeatherIcon from '@expo/vector-icons/Feather';
import Meteor, { withTracker } from 'react-native-meteor';
import { View, TouchableOpacity } from 'react-native';
import hoistStatics from 'hoist-non-react-statics';
import withPubNub from '../../Components/PubNubContext';
import { withTheme } from '../../Config/Theme';

class Messages extends Component {
  static navigationOptions = {
    title: 'Messages',
    tabBarIcon: ({ tintColor }) => <Icon name="message1" size={20} color={tintColor} />
  };

  constructor(props) {
    super(props);
    this.state = {
      messages: []
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
            avatar: 'https://facebook.github.io/react/img/logo_og.png'
          }
        }
      ]
    });
  }

  onSend(messages = []) {
    const { publish } = this.props;
    this.setState(
      previousState => ({
        messages: GiftedChat.append(previousState.messages, messages)
      }),
      () => {
        console.log('onSend', messages[0]);
        // publish(
        //   {channel: 'asdf', message: messages[0]},
        //   (status, result) => console.log(status, result)
        // );
      }
    );
  }

  render() {
    const {
      style,
      messages,
      publish,
      user,
      theme: { icon, align }
    } = this.props;
    return (
      <GiftedChat
        messages={this.state.messages}
        onSend={this.onSend}
        user={user}
        renderSend={props => (
          <Send
            {...props}
            containerStyle={[align.vertical, align.middle, { height: '100%', width: 60 }]}
          >
            <FeatherIcon
              name="send"
              style={[icon, { fontSize: 20, lineHeight: 20, paddingTop: 0 }]}
            />
          </Send>
        )}
        renderInputToolbar={props => (
          <InputToolbar
            {...props}
            composerHeight={60}
            // textInputStyle={[input]}
          />
        )}
        bottomOffset={160}
        minInputToolbarHeight={80}
        renderBubble={props => {
          // console.log('Bubble props', props.currentMessage);
          return <Bubble {...props} />;
        }}
      />
    );
  }
}

export default hoistStatics(
  withTheme(
    withPubNub({ subscribe: { channels: ['asdf'] } })(
      withTracker(() => {
        const myDataHandle = Meteor.subscribe('myData');
        const user = Meteor.user();
        return {
          user,
          myDataHandle
        };
      })(Messages)
    )
  ),
  Messages
);
