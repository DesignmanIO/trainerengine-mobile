import React, { useContext, useEffect, useState } from 'react';
import hoistStatics from 'hoist-non-react-statics';

import getTheme from './theme';

const defaultContext = {
  dark: false,
  toggle: () => null,
};

const ThemeContext = React.createContext(defaultContext);
const useTheme = () => useContext(ThemeContext);
const withTheme = WrappedComponent => hoistStatics(
  props => (
    <ThemeContext.Consumer>
      {value => <WrappedComponent {...props} theme={value} />}
    </ThemeContext.Consumer>
  ),
  WrappedComponent,
);

const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState();
  useEffect(() => {
    const timer = setInterval(() => {
      const hours = +new Date().getHours();
      if ((hours < 6 || hours > 18) && !dark) {
        setDark(true);
      } else if (dark) setDark(false);
    }, 1000);
    return () => clearInterval(timer);
  });

  const theme = getTheme({ dark });
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export default useTheme;
export { ThemeContext, ThemeProvider, withTheme };
