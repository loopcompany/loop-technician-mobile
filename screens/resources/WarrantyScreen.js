import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ImageBackground, Platform, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import ScreenHeaders from '../../components/ScreenHeaders';
import { useTranslation } from 'react-i18next';

import { themeColor0, themeColor1, themeColor4, themeColor10, themeColor14 } from '../../theme/Color';
import { infoAPI } from '../../services/Api';
import { cleanText, showToastOrAlert } from '../../helpers/Common';
import BlankScreen from '../../components/BlankScreen';
import Loader from '../../components/Loader';
import { createStyles } from '../../styles/NewStyles';

export default function WarrantyScreen() {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
  const [warranties, setWarranties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  const loadWarranties = useCallback(async ({ initial = false } = {}) => {
    try {
      const response = await infoAPI.getWarranty();

      if (response.status === 'success') {
        setWarranties(response.data);
        // Expand the first item on first load only, so a refresh keeps what the user opened.
        if (initial && response.data.length > 0) {
          setExpandedItems({ [response.data[0].id]: true });
        }
      } else {
        showToastOrAlert(t('Error loading information.'));
      }
    } catch (error) {
      console.log('Error loading warranties:', error);
      showToastOrAlert(t('Error loading information.'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    loadWarranties({ initial: true });
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadWarranties();
  }, [loadWarranties]);

  const toggleExpanded = useCallback((id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);

  const renderTermItem = ({ item, index }) => {
    const isExpanded = !!expandedItems[item.id];
    const periods = item?.warranties || [];
    const description = item.description ? cleanText(item.description) : '';

    return (
      <View style={[styles.termItem, isExpanded && styles.termItemExpanded]}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.termHeader}
          onPress={() => toggleExpanded(item.id)}
        >
          <View style={styles.termNumber}>
            <Text style={styles.termNumberText}>{index + 1}</Text>
          </View>
          <Text style={styles.termTitle}>{item.title}</Text>
          {periods.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{periods.length}</Text>
            </View>
          )}
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={themeColor0.bgColor(1)}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.termContent}>
            {!!description && (
              <View style={styles.description}>
                <Ionicons name="information-circle" size={20} color={themeColor0.bgColor(1)} />
                <Text style={styles.descriptionText}>{description}</Text>
              </View>
            )}

            {periods.length > 0 && (
              <View style={styles.periods}>
                {periods.map((warranty, i) => (
                  <View
                    key={warranty.id}
                    style={[styles.periodRow, i < periods.length - 1 && styles.periodDivider]}
                  >
                    <View style={styles.periodIcon}>
                      <Ionicons name="time-outline" size={16} color={themeColor0.bgColor(1)} />
                    </View>
                    <Text style={styles.periodText}>{warranty.title}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <Loader />
    )
  }
  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
      <ImageBackground cachePolicy={'memory-disk'} source={Platform.OS === 'web' ? require('../../assets/loopbackground.webp') : require("../../assets/moon.jpg")} style={[NewStyles.container, { backgroundColor: '#020305' }]} imageStyle={{ opacity: 0.8, }} contentPosition={'center'} contentFit={"cover"}>

        <ScreenHeaders title={t('Warranty test deadline')} />
        <FlatList
          data={warranties}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={themeColor4.bgColor(1)} colors={[themeColor0.bgColor(1)]} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.warrantiesContainer}
          renderItem={renderTermItem}
          ListEmptyComponent={() => {
            return (
              <BlankScreen />
            )
          }}

        />
      </ImageBackground>
    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
  warrantiesContainer: {
    padding: 15,
    paddingBottom: 130,
    flexGrow: 1,
  },
  termItem: {
    backgroundColor: themeColor4.bgColor(0.96),
    borderRadius: 14,
    borderCurve: 'continuous',
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: themeColor4.bgColor(0.2),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  termItemExpanded: {
    borderColor: themeColor1.bgColor(0.8),
  },
  termHeader: {
    ...NewStyles.row,
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 10,
  },
  termNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColor0.bgColor(1),
  },
  termNumberText: {
    ...NewStyles.title4,
    fontSize: 13,
  },
  termTitle: {
    ...NewStyles.title10,
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColor0.bgColor(0.12),
  },
  countBadgeText: {
    ...NewStyles.title10,
    fontSize: 12,
    textAlign: 'center',
    color: themeColor0.bgColor(1),
  },
  termContent: {
    paddingHorizontal: 12,
    paddingBottom: 14,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: themeColor10.bgColor(0.06),
    paddingTop: 12,
  },
  description: {
    ...NewStyles.row,
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: themeColor14.bgColor(0.6),
  },
  descriptionText: {
    ...NewStyles.text10,
    flex: 1,
    fontSize: 14,
    lineHeight: 24,
    color: themeColor10.bgColor(0.8),
  },
  periods: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: themeColor10.bgColor(0.08),
    overflow: 'hidden',
  },
  periodRow: {
    ...NewStyles.row,
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  periodDivider: {
    borderBottomWidth: 1,
    borderBottomColor: themeColor10.bgColor(0.06),
  },
  periodIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColor14.bgColor(1),
  },
  periodText: {
    ...NewStyles.text10,
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: themeColor10.bgColor(0.85),
  },
});
