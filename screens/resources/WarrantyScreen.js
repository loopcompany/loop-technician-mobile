import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, ImageBackground, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeaders from '../../components/ScreenHeaders';
import { useTranslation } from 'react-i18next';

import { themeColor0, themeColor1, themeColor4, themeColor10, themeColor14 } from '../../theme/Color';
import { infoAPI } from '../../services/Api';
import { cleanText, showToastOrAlert } from '../../helpers/Common';
import BlankScreen from '../../components/BlankScreen';
import { RefreshControl } from 'react-native';
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

  useEffect(() => {
    loadWarranties();
  }, [isRefreshing]);

  const loadWarranties = async () => {
    try {
      const response = await infoAPI.getWarranty();

      if (response.status === 'success') {
        setWarranties(response.data);
        // Expand first item by default
        if (response.data.length > 0) {
          setExpandedItems({ [response.data[0].id]: true });
        }
      } else {
        showToastOrAlert(t('Error loading privacy policy.'));
      }
    } catch (error) {
      console.log('Error loading warranties:', error);
      showToastOrAlert(t('Error loading privacy policy.'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const toggleExpanded = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderTermItem = ({ item }) => {
    const isExpanded = expandedItems[item.id];

    return (
      <View key={item.id} style={styles.termItem}>
        <TouchableOpacity
          style={[styles.termHeader, NewStyles.center, NewStyles.border10]}
          onPress={() => toggleExpanded(item.id)}
        >
          <Text style={styles.termTitle}>{item.title}</Text>
          <Ionicons
            name={"chevron-down"}
            size={20}
            color={themeColor1.bgColor(1)}
          />
        </TouchableOpacity>

        {(isExpanded) && (
          <View style={styles.termContent}>
            {item.description &&
              <View style={{ backgroundColor: themeColor1.bgColor(1), padding: 10 }}>
                <Text style={[styles.termDescription,]}>{cleanText(item.description)}</Text>
              </View>
            }

            <View style={{ backgroundColor: themeColor4.bgColor(1), marginTop: 10, borderColor: themeColor14.bgColor(1), borderWidth: 3 }}>

              {item?.warranties?.map((warranty, index) => (
                <View key={warranty.id} style={[{ paddingVertical: 10 }, index < item?.warranties?.length - 1 ? { borderBottomColor: themeColor14.bgColor(1), borderBottomWidth: 3, } : null]}>
                  <Text style={[NewStyles.title10, { textAlign: 'center' }]}>{warranty.title}</Text>
                </View>
              ))}
            </View>

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
      <ImageBackground cachePolicy={'memory-disk'} source={Platform.OS === 'web' ? require('../../assets/loopbackground.webp') : require("../../assets/moon.jpg")} style={[NewStyles.container, { backgroundColor: '#020305' }, NewStyles.center]} imageStyle={{ opacity: 0.8, }} contentPosition={'center'} contentFit={"cover"}>

        <ScreenHeaders title={t('Warranty / Guarantee')} />
        <FlatList
          data={warranties}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true) }} />}
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
  termItem: {
    backgroundColor: themeColor4.bgColor(0),
    borderRadius: 10,
    marginBottom: 10,
    gap: 10
  },
  termContent: {
    backgroundColor: themeColor4.bgColor(0),

    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  termDescription: {
    fontSize: 14,
    ...NewStyles.text10,
    marginBottom: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#e0f0ff',
  },
  header: {
    padding: 20,
    backgroundColor: themeColor4.bgColor(1),
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'VazirBold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'VazirLight',
    color: themeColor10.bgColor(0.7),
  },
  warrantiesContainer: {
    padding: 15,
    paddingBottom:130
  },
  warrantyItem: {
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
  warrantyHeader: {
    ...NewStyles.row,
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  warrantyTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'VazirBold',
    color: '#333',
    ...NewStyles.text10,
    marginRight: 10,
  },
  warrantyContent: {
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  warrantyDescription: {
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: '#666',
    ...NewStyles.text10,
    lineHeight: 22,
    marginBottom: 10,
  },
  warrantyDate: {
    fontSize: 12,
    fontFamily: 'VazirLight',
    color: themeColor10.bgColor(0.6),
    textAlign: 'right',
    fontStyle: 'italic',
  },
  aboutSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginTop: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  aboutTitle: {
    fontSize: 18,
    fontFamily: 'VazirBold',
    color: themeColor4.bgColor(1),
    textAlign: 'center',
    marginBottom: 15,
  },
  aboutText: {
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: '#666',
    textAlign: 'right',
    lineHeight: 22,
    marginBottom: 20,
  },
  contactInfo: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  contactTitle: {
    fontSize: 16,
    fontFamily: 'VazirBold',
    color: '#333',
    textAlign: 'right',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: '#666',
    textAlign: 'right',
    marginBottom: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'VazirLight',
    color: themeColor10.bgColor(0.7),
    marginTop: 15,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: themeColor4.bgColor(1),
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'VazirBold',
  },
  termHeader: {
    padding: 5,
    backgroundColor: themeColor0.bgColor(1),
  },
  termTitle: {
    flex: 1,
    fontSize: 16,
    ...NewStyles.title4,
  },
});
