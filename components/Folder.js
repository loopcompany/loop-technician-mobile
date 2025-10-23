import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import React from "react";
import { themeColor0, themeColor10 } from "../theme/Color";
import NewStyles from "../styles/NewStyles";

export default function Folder({
  onPress,
  title,
  style,
  loading,
}) {
  return (
    <TouchableOpacity
      disabled={loading}
      style={[styles.button, NewStyles.center, style]}
      onPress={onPress}
    >
  
      {/* {(!loading && image) && <Text style={NewStyles.title4}>{image}</Text>} */}

  
            <Image
                    source={require("../assets/folder.png")}
                    style={styles.folderIcon}
                  />
       <Text style={[NewStyles.title4, styles.folderText]}>{title}</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  button: {
    backgroundColor: themeColor10.bgColor(0.2),
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginVertical: 8,
    marginHorizontal: 8,
    width: 65,
    height: 65,
    alignItems: "center",
    justifyContent: "center",
  },
  folderIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    // marginTop: 5,
    marginBottom: 2,
  },
  folderText: {
    fontSize: 11,
    textAlign: "center",
  },
});