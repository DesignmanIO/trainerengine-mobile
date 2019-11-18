import React from 'react';
import { TouchableOpacity, ViewPropTypes } from 'react-native';
import PropTypes from 'proptypes';

import Text from './Text';
import { withTheme } from '../Config/Theme';

const Button = ({
  onPress, text, theme: { button, margin }, type, textStyle, buttonStyle,
}) => {
  const buttonStyles = [
    button.button.defaultStyle,
    margin.bottom.sm,
    button.button[type],
    buttonStyle,
  ];
  const textStyles = [
    button.text[type],
    textStyle,
  ];
  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      styleName="sm-gutter-bottom"
    >
      <Text style={textStyles}>{text}</Text>
    </TouchableOpacity>
  );
};

Button.propTypes = {
  onPress: PropTypes.func,
  text: PropTypes.string,
  buttonStyle: ViewPropTypes.style,
  textStyle: ViewPropTypes.style,
  type: PropTypes.oneOf(['default', 'primary', 'secondary', 'blank', 'row']),
};

Button.defaultProps = {
  onPress: () => null,
  text: '',
  buttonStyle: {},
  textStyle: {},
  type: 'none',
};

export default withTheme(Button);
