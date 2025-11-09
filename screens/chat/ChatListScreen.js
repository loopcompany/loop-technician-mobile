import { View, Text, FlatList, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor4, themeColor5 } from '../../theme/Color';
import { showToastOrAlert } from '../../helpers/Common';
import { getTechnicianChats } from '../../services/Api';
import ChatItem from './ChatItem';

export default function ChatListScreen({ navigation }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChats = async () => {
    try {
      console.log('📋 بارگذاری لیست چت‌ها...');
      const result = await getTechnicianChats();

      if (result.success) {
        setChats(result.chats || []);
        console.log(`✅ ${result.chats?.length || 0} چت دریافت شد`);
      } else {
        showToastOrAlert(result.message || 'خطا در دریافت لیست چت‌ها');
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      showToastOrAlert('خطا در دریافت لیست چت‌ها');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // بارگذاری اولیه و رفرش هنگام بازگشت به صفحه
  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchChats();
  };

  // محاسبه کل پیام‌های خوانده نشده
  const totalUnreadCount = chats.reduce((sum, chat) => sum + (chat.unread_count || 0), 0);

  if (loading && !chats.length) {
    return (
      <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
        <LinearGradient
          colors={['#7FDBFF', '#0074D9', '#001f3f']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.background}
        >
          <ScreenHeaders
            title={'پیام‌ها'}
            onPressLeft={() => navigation.goBack()}
            onPressRight={() => navigation.navigate('UserInfoScreen')}
          />
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>در حال بارگذاری...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
      <LinearGradient
        colors={['#7FDBFF', '#0074D9', '#001f3f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <ScreenHeaders
          title={totalUnreadCount > 0 ? `پیام‌ها (${totalUnreadCount})` : 'پیام‌ها'}
          onPressLeft={() => navigation.goBack()}
          onPressRight={() => navigation.navigate('UserInfoScreen')}
        />

        <FlatList
          data={chats}
          renderItem={({ item, index }) => (
            <ChatItem
              item={item}
              noBorder={index === chats.length - 1}
              navigation={navigation}
            />
          )}
          keyExtractor={(item) => item?.id?.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              colors={[themeColor1.bgColor(1)]}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>چتی وجود ندارد</Text>
              <Text style={styles.emptySubtext}>
                بعد از شروع کار با کاربران، پیام‌ها اینجا نمایش داده می‌شوند
              </Text>
            </View>
          }
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    fontWeight: 'bold',
  },
  listContent: {
    paddingVertical: 10,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtext: {
    color: themeColor5.bgColor(0.8),
    fontSize: 14,
    textAlign: 'center',
  },
});
