import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import ScreenHeaders from '../../components/ScreenHeaders';
import { createStyles } from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor4, themeColor10 } from '../../theme/Color';
import {
  ABOUT_HEADING,
  ABOUT_TAGLINE,
  ABOUT_INTRO,
  ABOUT_SECTIONS,
  ABOUT_BRAND,
  ABOUT_MOTTO,
  ABOUT_SLOGAN,
} from '../../assets/content/aboutLoop';

// About LOOP (LOOP menu item 07). The text ships with the app — it comes from
// «درباره ما اپ تکنسین.docx» — so it is Persian and always laid out
// right-to-left, whatever the app language.
const PILLAR_ICONS = ['construct', 'hardware-chip', 'shield-checkmark'];

export default function AboutScreen() {
  const { t } = useTranslation();
  const NewStyles = useMemo(() => createStyles('fa'), []);
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
      <ScreenHeaders title={t('About us')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, NewStyles.center]}>
          <Image source={require('../../assets/images/loop-logo-sphere.jpg')} style={styles.heroLogo} />
          <Text style={[NewStyles.title, styles.heroHeading]}>{ABOUT_HEADING}</Text>
          <Text style={[NewStyles.text10, styles.heroTagline]}>{ABOUT_TAGLINE}</Text>
        </View>

        <View style={styles.card}>
          {ABOUT_INTRO.map((paragraph) => (
            <Text key={paragraph} style={styles.paragraph}>{paragraph}</Text>
          ))}
        </View>

        {ABOUT_SECTIONS.map((section) => (
          <View key={section.title} style={styles.card}>
            <View style={[NewStyles.row, styles.sectionHeader]}>
              <View style={styles.sectionMarker} />
              <Text style={[NewStyles.title, styles.sectionTitle]}>{section.title}</Text>
            </View>
            {!!section.subtitle && (
              <Text style={[NewStyles.title10, styles.sectionSubtitle]}>{section.subtitle}</Text>
            )}
            {section.paragraphs.map((paragraph) => (
              <Text key={paragraph} style={styles.paragraph}>{paragraph}</Text>
            ))}
            {section.pillars?.map((pillar, index) => (
              <View key={pillar.title} style={[NewStyles.row, styles.pillar]}>
                <View style={[styles.pillarIcon, NewStyles.center]}>
                  <Ionicons name={PILLAR_ICONS[index] || 'star'} size={20} color={themeColor4.bgColor(1)} />
                </View>
                <View style={styles.pillarBody}>
                  <Text style={[NewStyles.title10, styles.pillarTitle]}>{pillar.title}</Text>
                  <Text style={styles.paragraph}>{pillar.text}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}

        <View style={[styles.closing, NewStyles.center]}>
          <Text style={styles.closingBrand}>{ABOUT_BRAND}</Text>
          <Text style={styles.closingMotto}>{ABOUT_MOTTO}</Text>
          <Text style={[NewStyles.title4, styles.closingSlogan]}>{ABOUT_SLOGAN}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
  content: {
    padding: 15,
    paddingBottom: 130,
  },
  hero: {
    paddingVertical: 10,
    marginBottom: 10,
  },
  heroLogo: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  heroHeading: {
    fontSize: 22,
    textAlign: 'center',
    marginTop: 8,
  },
  heroTagline: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    gap: 8,
    marginBottom: 4,
  },
  sectionMarker: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: themeColor1.bgColor(1),
  },
  sectionTitle: {
    flex: 1,
    fontSize: 17,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: themeColor10.bgColor(0.6),
    marginBottom: 6,
  },
  paragraph: {
    ...NewStyles.text10,
    fontSize: 14,
    lineHeight: 25,
    color: themeColor10.bgColor(0.8),
    marginTop: 4,
  },
  pillar: {
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 10,
  },
  pillarIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: themeColor0.bgColor(1),
  },
  pillarBody: {
    flex: 1,
  },
  pillarTitle: {
    fontSize: 15,
  },
  closing: {
    marginTop: 6,
    padding: 20,
    borderRadius: 10,
    backgroundColor: themeColor0.bgColor(1),
  },
  closingBrand: {
    fontSize: 26,
    letterSpacing: 6,
    fontFamily: 'VazirBold',
    color: themeColor1.bgColor(1),
    textAlign: 'center',
  },
  closingMotto: {
    fontSize: 12,
    fontFamily: 'VazirLight',
    color: themeColor4.bgColor(0.85),
    textAlign: 'center',
    marginTop: 4,
  },
  closingSlogan: {
    marginTop: 10,
  },
});
