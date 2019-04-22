import { getTheme } from '@shoutem/ui';
import componentStyles from './componentStyles';
import viewStyles from './viewStyles';
import colors from './colors';

const Theme = {
  ...getTheme(),
  ...componentStyles,
  ...viewStyles,
  'shoutem.ui.TextInput': {
    ...getTheme()['shoutem.ui.TextInput'],
    borderBottomWidth: 1,
    borderColor: colors.lightGrey,
  },
};

export default Theme;
