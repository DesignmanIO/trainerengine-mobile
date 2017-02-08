import React, {Component} from 'react';
import {GiftedChat, Bubble} from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/Ionicons';
import {connectStyle} from '@shoutem/theme';

import {navigationOptions} from '../../Config/Theme';

class Messages extends Component {
      static navigationOptions = {
        ...navigationOptions,
        title: "Messages",
          tabBar: {
              icon: ({tintColor}) => {
                  return (
                    <Icon name = "ios-chatbubbles-outline" size = {20} style={{color: tintColor}}/>
                  );
              },
          }
      }

    constructor(props) {
        super(props);
        this.state = {
            messages: []
        };
        this.onSend = this.onSend.bind(this);
    }

    componentWillMount() {
        this.setState({
            messages: [{
                _id: 1,
                text: 'Hello developer',
                createdAt: new Date(Date.UTC(2016, 7, 30, 17, 20, 0)),
                user: {
                    _id: 2,
                    name: 'React Native',
                    avatar: 'https://facebook.github.io/react/img/logo_og.png',
                },
            }, ],
        });
    }
    onSend(messages = []) {
        this.setState((previousState) => {
            return {
                messages: GiftedChat.append(previousState.messages, messages),
            };
        });
    }
    render() {
      const {style} = this.props;
        //return <View />
        return (
          <GiftedChat
            messages = {this.state.messages}
            onSend = {this.onSend}
            user = {{_id: 1,}}
            renderBubble = {(props) => {
              console.log('props', props);
              return (
                <Bubble {...props} wrapperStyle={style.messageWrapper}/>
              );
            }}
          />
        );
    }
}

export default connectStyle('te.views.Messages', {})(Messages);
