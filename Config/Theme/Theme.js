import {getTheme} from '@shoutem/ui';
import componentStyles from './componentStyles';
import viewStyles from './viewStyles';

const Theme = {
  ...getTheme(),
  ...componentStyles,
  ...viewStyles,
};

export default Theme;
