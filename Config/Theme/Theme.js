import colors from './colors';

const spacing = { sm: 10, md: 20, lg: 40 };

const getSpacingObj = key => ({
  sm: { [key]: 10 },
  md: { [key]: 20 },
  lg: { [key]: 40 },
});

const getTheme = ({ dark }) => ({
  dark,
  button: {
    defaultStyle: {
      paddingTop: spacing.sm * 1.5,
      paddingBottom: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 60,
      borderWidth: 1,
      borderColor: colors.subtleText,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // text: { verticalAlign: 'center' },
  },
  input: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.subtleText,
  },
  image: {
    fill: { width: '100%', resizeMode: 'contain' },
  },
  text: {
    defaultStyle: {
      fontFamily: 'MPlus1',
      fontSize: 17,
      lineHeight: 17,
      color: colors.text,
    },
    bold: { fontFamily: 'Montserrat Bold' },
    title: { fontSize: 32, lineHeight: 32, fontFamily: 'Montserrat Regular' },
    subtitle: { fontSize: 24, lineHeight: 24, fontFamily: 'Montserrat Regular' },
    subtle: { color: colors.subtleText },
    caption: { fontSize: 12, lineHeight: 12, color: colors.subtleText },
  },
  padding: {
    ...getSpacingObj('padding'),
    v: getSpacingObj('paddingVertical'),
    h: getSpacingObj('paddingHorizontal'),
    top: getSpacingObj('paddingVertical'),
    right: getSpacingObj('paddingHorizontal'),
    bottom: getSpacingObj('paddingVertical'),
    left: getSpacingObj('paddingHorizontal'),
  },
  margin: {
    ...getSpacingObj('margin'),
    v: getSpacingObj('marginVertical'),
    h: getSpacingObj('marginHorizontal'),
    top: getSpacingObj('marginVertical'),
    right: getSpacingObj('marginHorizontal'),
    bottom: getSpacingObj('marginVertical'),
    left: getSpacingObj('marginHorizontal'),
  },
  flex: { flex: 1 },
  align: {
    vertical: { flexDirection: 'column' },
    horizontal: { flexDirection: 'row' },
    start: { alignItems: 'flex-start' },
    center: { alignItems: 'center' },
    end: { alignItems: 'flex-end' },
    stretch: { alignSelf: 'stretch', alignItems: 'stretch' },
    top: { justifyContent: 'flex-start' },
    middle: { justifyContent: 'center' },
    bottom: { justifyContent: 'flex-end' },
    between: { justifyContent: 'space-between' },
    around: { justifyContent: 'space-around' },
  },
  debug: {
    borderColor: 'red',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  swipeout: {
    icon: {
      fontSize: 35,
      alignSelf: 'center',
      color: 'white',
      paddingTop: 35 / 2,
    },
    backgroundColor: colors.success,
    container: {
      backgroundColor: 'white',
      borderWidth: 0.5,
      borderColor: colors.lightGrey,
      // display: 'flex',
      // alignItems: 'center',
    },
    row: {
      height: 70,
    },
  },
});

export default getTheme;
