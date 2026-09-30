import React from 'react';
import { View } from 'react-native';
import useFooterSpace from '../hooks/useFooterSpace';

// Keeps the end of a list clear of the floating dock:
//   <FlatList ListFooterComponent={<FooterSpacer />} … />
function FooterSpacer() {
  const footerSpace = useFooterSpace();
  if (!footerSpace) return null;
  return <View style={{ height: footerSpace }} pointerEvents="none" />;
}

export default React.memo(FooterSpacer);
