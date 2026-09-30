import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import ScreenHeaders from '../../components/ScreenHeaders';
import { createStyles } from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor4, themeColor10 } from '../../theme/Color';
import {
  PRIVACY_HEADING,
  PRIVACY_APP_NAME,
  PRIVACY_SECTIONS,
  PRIVACY_MOTTO,
  PRIVACY_MOTTO_TEXT,
  PRIVACY_DOC_INFO,
} from '../../assets/content/privacyPolicy';

// Loop's privacy policy, opened from the LOOP menu (edits list 1405/07/03,
// item 15). Not to be confused with PrivacyScreen, which is the technician's
// account area (personal / vehicle / financial info). The text ships with the
// app — it comes from «حریم_خصوصی_و_حفاظت_از_اطلاعات_در_اپلیکیشن_LOOP_Tech.pdf»
// — so it is Persian and always laid out right-to-left, whatever the app language.
export default function PrivacyPolicyScreen() {
  const { t } = useTranslation();
  const NewStyles = useMemo(() => createStyles('fa'), []);
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
  // First section open by default
  const [expandedItems, setExpandedItems] = useState({ [PRIVACY_SECTIONS[0].number]: true });

  const toggleExpanded = (id) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderBullets = (items) => items.map((item) => (
    <View key={item} style={[NewStyles.row, styles.bullet]}>
      <View style={styles.bulletDot} />
      <Text style={[styles.paragraph, styles.bulletText]}>{item}</Text>
    </View>
  ));

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
      <ScreenHeaders title={t('Privacy Policy')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, NewStyles.center]}>
          <View style={[styles.heroIcon, NewStyles.center]}>
            <Ionicons name="shield-checkmark" size={36} color={themeColor4.bgColor(1)} />
          </View>
          <Text style={[NewStyles.title, styles.heroHeading]}>{PRIVACY_HEADING}</Text>
          <Text style={[NewStyles.text10, styles.heroTagline]}>{PRIVACY_APP_NAME}</Text>
        </View>

        {PRIVACY_SECTIONS.map((section) => {
          const isExpanded = expandedItems[section.number];
          return (
            <View key={section.number} style={styles.item}>
              <TouchableOpacity
                style={[NewStyles.row, styles.itemHeader, isExpanded && styles.itemHeaderExpanded]}
                onPress={() => toggleExpanded(section.number)}
              >
                <View style={[styles.itemNumber, NewStyles.center]}>
                  <Text style={styles.itemNumberText}>{section.number}</Text>
                </View>
                <Text style={[NewStyles.title10, styles.itemTitle]}>{section.title}</Text>
                <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={themeColor4.bgColor(1)} />
              </TouchableOpacity>
              {isExpanded && (
                <View style={styles.itemContent}>
                  {section.paragraphs?.map((paragraph) => (
                    <Text key={paragraph} style={styles.paragraph}>{paragraph}</Text>
                  ))}
                  {section.groups?.map((group) => (
                    <View key={group.title} style={styles.group}>
                      <Text style={[NewStyles.title10, styles.groupTitle]}>{group.title}</Text>
                      {renderBullets(group.items)}
                    </View>
                  ))}
                  {section.items && renderBullets(section.items)}
                  {section.footer?.map((paragraph) => (
                    <Text key={paragraph} style={[styles.paragraph, styles.footer]}>{paragraph}</Text>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <View style={[styles.closing, NewStyles.center]}>
          <Text style={[NewStyles.title4, styles.closingMotto]}>{PRIVACY_MOTTO}</Text>
          <Text style={styles.closingText}>{PRIVACY_MOTTO_TEXT}</Text>
        </View>

        <View style={styles.docInfo}>
          {PRIVACY_DOC_INFO.map((line) => (
            <Text key={line} style={styles.docInfoLine}>{line}</Text>
          ))}
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
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: themeColor0.bgColor(1),
  },
  heroHeading: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 10,
  },
  heroTagline: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemHeader: {
    padding: 15,
    gap: 10,
  },
  itemHeaderExpanded: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: themeColor0.bgColor(1),
  },
  itemNumberText: {
    fontSize: 13,
    fontFamily: 'VazirBold',
    color: themeColor1.bgColor(1),
  },
  itemTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  itemContent: {
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  paragraph: {
    ...NewStyles.text10,
    fontSize: 14,
    lineHeight: 25,
    color: themeColor10.bgColor(0.8),
    marginTop: 4,
  },
  group: {
    marginTop: 10,
  },
  groupTitle: {
    fontSize: 14,
    color: themeColor4.bgColor(1),
  },
  bullet: {
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 14,
    backgroundColor: themeColor1.bgColor(1),
  },
  bulletText: {
    flex: 1,
  },
  footer: {
    marginTop: 10,
  },
  closing: {
    marginTop: 6,
    padding: 20,
    borderRadius: 10,
    backgroundColor: themeColor0.bgColor(1),
  },
  closingMotto: {
    fontSize: 18,
    textAlign: 'center',
  },
  closingText: {
    ...NewStyles.text10,
    fontSize: 14,
    lineHeight: 25,
    textAlign: 'center',
    color: themeColor4.bgColor(0.85),
    marginTop: 8,
  },
  docInfo: {
    marginTop: 16,
    paddingHorizontal: 5,
  },
  docInfoLine: {
    ...NewStyles.text10,
    fontSize: 12,
    lineHeight: 22,
    color: themeColor10.bgColor(0.5),
  },
});
