import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import ScreenHeaders from '../../components/ScreenHeaders';
import BlankScreen from '../../components/BlankScreen';
import Loader from '../../components/Loader';
import { createStyles } from '../../styles/NewStyles';
import { themeColor4, themeColor10 } from '../../theme/Color';
import { infoAPI } from '../../services/Api';
import { showToastOrAlert } from '../../helpers/Common';

// Loop's privacy policy (GET /info/privacy), opened from the LOOP menu (edits
// list 1405/07/03, item 15). Not to be confused with PrivacyScreen, which is
// the technician's account area (personal / vehicle / financial info).
export default function PrivacyPolicyScreen() {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(() => createStyles(i18n.language), [i18n.language]);
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  const loadPolicy = useCallback(async () => {
    try {
      const response = await infoAPI.getPrivacy();
      if (response?.status === 'success' && Array.isArray(response.data)) {
        setSections(response.data);
        // First section open by default
        if (response.data.length > 0) {
          setExpandedItems({ [response.data[0].id]: true });
        }
      } else {
        showToastOrAlert(t('Error loading privacy policy.'));
      }
    } catch (error) {
      showToastOrAlert(t('Error loading privacy policy.'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    loadPolicy();
  }, [loadPolicy]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadPolicy();
  };

  const toggleExpanded = (id) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderSection = ({ item }) => {
    const isExpanded = expandedItems[item.id];
    return (
      <View style={styles.item}>
        <TouchableOpacity style={styles.itemHeader} onPress={() => toggleExpanded(item.id)}>
          <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={themeColor4.bgColor(1)} />
          <Text style={styles.itemTitle}>{item.title}</Text>
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.itemContent}>
            <Text style={styles.itemDescription}>{item.description}</Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
      <ScreenHeaders title={t('Privacy Policy')} />
      <FlatList
        data={sections}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={renderSection}
        ListEmptyComponent={<BlankScreen />}
      />
    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
  list: {
    padding: 15,
    paddingBottom: 130,
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
    ...NewStyles.row,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemTitle: {
    ...NewStyles.text10,
    flex: 1,
    fontSize: 16,
    fontFamily: NewStyles.title10.fontFamily,
    color: '#333',
    marginHorizontal: 10,
  },
  itemContent: {
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  itemDescription: {
    ...NewStyles.text10,
    fontSize: 14,
    color: themeColor10.bgColor(0.7),
    lineHeight: 24,
  },
});
