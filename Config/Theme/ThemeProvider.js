import React, { useContext, useEffect, useState } from 'react';
import getTheme from './theme';

const defaultContext = {
  dark: false,
  toggle: () => null,
};

const ThemeContext = React.createContext(defaultContext);
const useTheme = () => useContext(ThemeContext);

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
  return <ThemeContext.Provider theme={theme}>{children}</ThemeContext.Provider>;
};

export default useTheme;
export { ThemeContext, ThemeProvider };
