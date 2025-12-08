import { StyleSheet, Platform, Dimensions } from "react-native";
import {
  themeColor0,
  themeColor1,
  themeColor2,
  themeColor3,
  themeColor4,
  themeColor5,
  themeColor6,
  themeColor7,
  themeColor8,
  themeColor9,
  themeColor10,
  themeColor11,
  themeColor14,
} from "../theme/Color";

export const { width: deviceWidth, height: deviceHeight } =
  Dimensions.get("window");
export const CELL_SIZE = 45;
export const CELL_BORDER_RADIUS = Platform.OS === "ios" ? 8 : 0;

// Pre-calculate all color values outside StyleSheet.create to prevent re-renders
const COLOR_0_FULL = themeColor0.bgColor(1);
const COLOR_0_07 = themeColor0.bgColor(0.7);
const COLOR_0_05 = themeColor0.bgColor(0.5);
const COLOR_0_02 = themeColor0.bgColor(0.2);
const COLOR_1_FULL = themeColor1.bgColor(1);
const COLOR_1_08 = themeColor1.bgColor(0.8);
const COLOR_1_05 = themeColor1.bgColor(0.5);
const COLOR_1_02 = themeColor1.bgColor(0.2);
const COLOR_2_FULL = themeColor2.bgColor(1);
const COLOR_3_FULL = themeColor3.bgColor(1);
const COLOR_4_FULL = themeColor4.bgColor(1);
const COLOR_4_07 = themeColor4.bgColor(0.7);
const COLOR_6_FULL = themeColor6.bgColor(1);
const COLOR_7_FULL = themeColor7.bgColor(1);
const COLOR_10_FULL = themeColor10.bgColor(1);
const COLOR_11_FULL = themeColor11.bgColor(1);
const COLOR_14_FULL = themeColor14.bgColor(1);

export const DEFAULT_CELL_BG_COLOR = COLOR_1_FULL;
export const NOT_EMPTY_CELL_BG_COLOR = COLOR_0_FULL;
export const ACTIVE_CELL_BG_COLOR = COLOR_1_FULL;

export const gradientColors = [
  COLOR_0_FULL,
  COLOR_0_07,
  COLOR_0_05,
  COLOR_0_02,
  COLOR_1_02,
  COLOR_1_05,
  COLOR_1_08,
  COLOR_1_FULL,
];

const NewStyles = StyleSheet.create({
  selectBox: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  categoriesWrapper: {
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 10,
  },
  wrapper: {
    // paddingHorizontal: "5%",
    gap: 10,
    paddingTop:10
  },
  formGroup: {
    marginVertical: 5,
    gap: 10,
  },
  codeFieldRoot: {
    height: 45,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  button: {
    marginVertical: 20,
    // padding: 15,
    alignItems: "center",
    borderRadius: 5,
  },
  circularWrapper: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 10,
  },
  contentContainerStyle: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cell: {
    marginHorizontal: 8,
    height: 45,
    width: 45,
    lineHeight: 45 - 5,
    borderBottomColor: COLOR_0_FULL,
    borderBottomWidth: StyleSheet.hairlineWidth,
    ...Platform.select({ web: { lineHeight: 65 } }),
    fontSize: 24,
    textAlign: "center",
    borderRadius: 8,
    borderCurve: "continuous",
    overflow: "hidden",
    color: COLOR_0_FULL,
    backgroundColor: "#fff",
  },
  status: {
    fontFamily: "VazirLight",
    color: COLOR_3_FULL,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  logo: {
    width: 200,
    height: 100,
  },
  container: {
    flex: 1,
    backgroundColor: COLOR_14_FULL,
    ...(Platform.OS === 'web' && {
      width: '100%',
      maxWidth: '100vw',
      overflow: 'hidden',
    }),
  },

  center: {
    alignItems: "center",
    justifyContent: "center",
  },

  rowWrapper: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },

  shadow: {
    shadowColor: COLOR_0_FULL,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 5,
  },

  border5: {
    borderRadius: 5,
    borderCurve: "continuous",
    overflow: "hidden",
  },

  border10: {
    borderRadius: 10,
    borderCurve: "continuous",
    // overflow: "hidden",
  },

  border100: {
    borderRadius: 100,
    borderCurve: "continuous",
    overflow: "hidden",
  },

  text: {
    fontFamily: "VazirLight",
    color: COLOR_0_FULL,
    textAlign: "right",
  },

  text1: {
    fontFamily: "VazirLight",
    color: COLOR_1_FULL,
    textAlign: "right",
  },

  text2: {
    fontFamily: "VazirLight",
    color: COLOR_2_FULL,
    textAlign: "right",
  },

  text3: {
    fontFamily: "VazirLight",
    color: COLOR_3_FULL,
    textAlign: "right",
  },

  text4: {
    fontFamily: "VazirLight",
    color: COLOR_4_FULL,
    textAlign: "right",
  },

  text6: {
    fontFamily: "VazirLight",
    color: COLOR_6_FULL,
    textAlign: "right",
  },

  text7: {
    fontFamily: "VazirLight",
    color: COLOR_7_FULL,
    textAlign: "right",
  },

  text10: {
    fontFamily: "VazirLight",
    color: COLOR_10_FULL,
    textAlign: "right",
  },
  text11: {
    fontFamily: "VazirLight",
    color: COLOR_11_FULL,
    textAlign: "right",
  },

  title: {
    fontSize: 16,
    fontFamily: "VazirBold",
    color: COLOR_0_FULL,
    textAlign: "right",
  },
  title1: {
    fontSize: 16,
    fontFamily: "VazirBold",
    color: COLOR_1_FULL,
    textAlign: "right",
  },

  title4: {
    fontSize: 15,
    fontFamily: "VazirBold",
    color: COLOR_4_FULL,
    textAlign: "center",
  },
  title7: {
    fontSize: 15,
    fontFamily: "VazirBold",
    color: COLOR_7_FULL,
    textAlign: "center",
  },

  title10: {
    fontSize: 16,
    fontFamily: "VazirBold",
    color: COLOR_10_FULL,
    textAlign: "right",
  },
  background: {
    position: "absolute",
    zIndex: 1,
    width: "100%",
    top: 0,
    height: 200,
  },
  discountText: {
    fontFamily: "VazirLight",
    color: COLOR_3_FULL,
    textDecorationLine: "line-through",
    textAlign: "right",
  },

  textInput: {
    backgroundColor: COLOR_4_07,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "100%",
  },

  profileImage: {
    height: 70,
    wiidth: 70,
    backgroundColor: COLOR_4_FULL,
  },

  more: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderColor: COLOR_4_FULL,
    borderWidth: 0.2,
  },
});

export default NewStyles;
