import React from 'react';
import { Text as RNText } from 'react-native';
import useTheme from '../Config/Theme';

const Text = ({ style, ...props }) => {
  const { text: { defaultStyle } } = useTheme();
  return <RNText style={[ defaultStyle, style ]} {...props} />;
};

export default Text;
