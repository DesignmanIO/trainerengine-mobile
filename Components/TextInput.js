import React from 'react';
import { TextInput as RNTextInput } from 'react-native';
import useTheme from '../Config/Theme';

const TextInput = ({ style, ...props }) => {
  const { input, text } = useTheme();
  return <RNTextInput style={[input, text.defaultStyle, style]} {...props} />;
};

export default TextInput;
