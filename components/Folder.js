import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { memo } from "react";
import { Image } from "expo-image";
import { themeColor0, themeColor10 } from "../theme/Color";
import NewStyles from "../styles/NewStyles";

function Folder({
  onPress,
  title,
  style,
  loading,
  image
}) {
  return (
    <TouchableOpacity
      disabled={loading}
      style={[styles.button, NewStyles.center, style]}
      onPress={onPress}
    >

      {/* {(!loading && image) && <Text style={NewStyles.title4}>{image}</Text>} */}


      <Image
        source={image ? { uri: image } : undefined}
        style={styles.folderIcon}
        contentFit="contain"
        cachePolicy="memory-disk"
        transition={150}
      />
      <Text style={[NewStyles.title4, styles.folderText]}> {title} </Text>
    </TouchableOpacity>
  );
}
export default memo(Folder);

const styles = StyleSheet.create({
  button: {
    backgroundColor: themeColor10.bgColor(0.2),
    borderRadius: 8,
    // paddingHorizontal: 8,
    paddingVertical: 8,
    marginVertical: 8,
    marginHorizontal: 8,
    width: 100,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  folderIcon: {
    width: 50,
    height: 50,
    // marginTop: 5,
    marginBottom: 2,
    ...NewStyles.border10
  },
  folderText: {
    fontSize: 11,
    textAlign: "center",
  },
});