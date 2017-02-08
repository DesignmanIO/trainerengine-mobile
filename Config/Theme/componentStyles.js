import colors from './colors';

const componentStyles = {
  'te.component.Task': {
    swipeoutContainer: {
      // display: 'flex',
      // alignItems: 'center',
    },
    swipeout: {
      backgroundColor: colors.green,
    },
    swipeoutIcon: {
      // flexGrow: 1,
      fontSize: 35,
      alignSelf: 'center',
      color: 'white',
      paddingTop: 35 / 2,
    },
    taskRow: {
      height: 70,
    },
  },
};

export default componentStyles;
