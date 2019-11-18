import React from 'react';
import { TextInput as RNTextInput } from 'react-native';
import useTheme from '../Config/Theme';

const TextInput = ({ style, inputRef, ...props }) => {
  const { input, text } = useTheme();
  return (
    <RNTextInput
      ref={inputRef}
      style={[input, text.defaultStyle, style]}
      {...props}
    />
  );
};

export default TextInput;
