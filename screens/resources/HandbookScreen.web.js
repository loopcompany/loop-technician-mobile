import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Asset } from 'expo-asset';
import { useTranslation } from 'react-i18next';

import ScreenHeaders from '../../components/ScreenHeaders';
import { createStyles } from '../../styles/NewStyles';

// Web: the browser's own PDF viewer shows the bundled handbook.
const HANDBOOK_URI = Asset.fromModule(require('../../assets/docs/technician-handbook.pdf')).uri;

export default function HandbookScreen() {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(() => createStyles(i18n.language), [i18n.language]);

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
      <ScreenHeaders title={t('Rules')} />
      <View style={styles.body}>
        <iframe title={t('Rules')} src={HANDBOOK_URI} style={{ border: 0, width: '100%', height: '100%' }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingBottom: 110,
  },
});
