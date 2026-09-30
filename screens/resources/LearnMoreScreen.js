import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import ScreenHeaders from '../../components/ScreenHeaders';
import { createStyles } from '../../styles/NewStyles';
import { themeColor0, themeColor4, themeColor10 } from '../../theme/Color';
import { FAQ_TITLE, FAQ_CLOSING_NOTE, TECHNICIAN_FAQ } from '../../assets/content/technicianFaq';

// Technician FAQ (LOOP menu item 05). The questions ship with the app — they
// come from «سؤالات و پاسخ اپ تکنسین.docx» — so the text is Persian and always
// laid out right-to-left, whatever the app language.
const normalize = (text) => text.replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').replace(/‌/g, ' ');

export default function LearnMoreScreen() {
  const { t } = useTranslation();
  const NewStyles = useMemo(() => createStyles('fa'), []);
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
  const [query, setQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState({ [TECHNICIAN_FAQ[0].id]: true });

  const faqs = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return TECHNICIAN_FAQ;
    return TECHNICIAN_FAQ.filter(
      (item) => normalize(item.question).includes(q) || normalize(item.answer).includes(q)
    );
  }, [query]);

  const toggleExpanded = useCallback((id) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const renderFaqItem = ({ item }) => {
    const isExpanded = !!expandedItems[item.id] || !!query.trim();

    return (
      <View style={styles.faqItem}>
        <TouchableOpacity style={styles.faqHeader} onPress={() => toggleExpanded(item.id)}>
          <View style={styles.faqNumber}>
            <Text style={styles.faqNumberText}>{item.id}</Text>
          </View>
          <Text style={styles.faqTitle}>{item.question}</Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={themeColor0.bgColor(1)}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.faqContent}>
            <Text style={styles.faqDescription}>{item.answer}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      <View style={[styles.intro, NewStyles.row]}>
        <Image source={require('../../assets/images/menu/05-faq.png')} style={styles.introIcon} />
        <Text style={[NewStyles.title, styles.introTitle]}>{FAQ_TITLE}</Text>
      </View>
      <View style={[styles.search, NewStyles.row]}>
        <Ionicons name="search" size={18} color={themeColor10.bgColor(0.5)} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('Search questions')}
          placeholderTextColor={themeColor10.bgColor(0.4)}
          style={[NewStyles.text10, styles.searchInput]}
          returnKeyType="search"
        />
        {!!query && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={themeColor10.bgColor(0.5)} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
      <ScreenHeaders title={t('FAQ')} />
      <FlatList
        data={faqs}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={renderHeader()}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.faqsContainer}
        renderItem={renderFaqItem}
        ListEmptyComponent={
          <Text style={[NewStyles.text10, styles.empty]}>{t('No matching question was found.')}</Text>
        }
        ListFooterComponent={
          faqs.length > 0 ? (
            <View style={[styles.closingNote, NewStyles.row]}>
              <Ionicons name="shield-checkmark" size={22} color={themeColor4.bgColor(1)} />
              <Text style={[NewStyles.text4, styles.closingNoteText]}>{FAQ_CLOSING_NOTE}</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
  faqsContainer: {
    padding: 15,
    paddingBottom: 130,
  },
  intro: {
    gap: 10,
    marginBottom: 12,
  },
  introIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  introTitle: {
    flex: 1,
    fontSize: 18,
  },
  search: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  faqItem: {
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
  faqHeader: {
    ...NewStyles.row,
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  faqNumber: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColor0.bgColor(0.12),
  },
  faqNumberText: {
    ...NewStyles.title,
    fontSize: 12,
    textAlign: 'center',
  },
  faqTitle: {
    ...NewStyles.title10,
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
  },
  faqContent: {
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  faqDescription: {
    ...NewStyles.text10,
    fontSize: 14,
    color: themeColor10.bgColor(0.75),
    lineHeight: 24,
  },
  empty: {
    textAlign: 'center',
    marginTop: 30,
  },
  closingNote: {
    marginTop: 6,
    padding: 14,
    gap: 10,
    borderRadius: 10,
    backgroundColor: themeColor0.bgColor(1),
  },
  closingNoteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 24,
  },
});
