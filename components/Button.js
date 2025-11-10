import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { themeColor0, themeColor10, themeColor4 } from "../theme/Color";
import NewStyles from "../styles/NewStyles";

// Pre-calculate colors to prevent re-renders
const BUTTON_BG_COLOR = themeColor0.bgColor(1);
const LOADING_COLOR = themeColor4.bgColor(1);

export default function Button({ onPress, title, style, loading, disabled, textStyle }) {
  return (
    <TouchableOpacity
      disabled={loading || disabled}
      style={[styles.button, NewStyles.shadow, NewStyles.border10, NewStyles.center, style]}
      onPress={onPress}
    >
      {loading && (
        <ActivityIndicator size={"small"} color={LOADING_COLOR} />
      )}
      {!loading && <Text style={[NewStyles.title1,textStyle]}>{title}</Text>}
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  button: {
    backgroundColor: BUTTON_BG_COLOR,
    paddingHorizontal: 40,
    marginVertical: 10,
    width: "100%",
    height: 50,
    alignItems: "center",
    maxWidth: 400,
    alignSelf: 'center',
  },

});
