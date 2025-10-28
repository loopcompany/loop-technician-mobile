import React, { createContext, useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  Linking,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { themeColor0, themeColor10, themeColor13, themeColor4 } from '../theme/Color';
import NewStyles from '../styles/NewStyles';
import { SafeAreaView } from 'react-native-safe-area-context';

const FooterContext = createContext();

export const useFooter = () => {
  const context = useContext(FooterContext);
  if (!context) {
    throw new Error('useFooter must be used within a FooterProvider');
  }
  return context;
};

export const FooterProvider = ({ children }) => {
  const navigation = useNavigation();
  const [isFooterVisible, setIsFooterVisible] = useState(true);
  const [menuItems, setMenuItems] = useState([
    { id: 1, title: ' سازمانی / شرکتی', screen: 'DeviceOrderSummary' },
    { id: 2, title: ' ثبت نام دوره های آموزشی ', screen: 'CorporateScreen' },
    { id: 3, title: 'ضمانت نامه/گارانتی', screen: 'OrdersScreen' },
    { id: 4, title: 'سوالات متداول', screen: 'TransactionsScreen' },
    { id: 5, title: ' قوانین/درباره لوپ', screen: 'CanceledOrdersScreen' },
  ]);
  const [menuVisible, setMenuVisible] = useState(false);

  const showFooter = () => setIsFooterVisible(true);
  const hideFooter = () => setIsFooterVisible(false);
  const toggleFooter = () => setIsFooterVisible(!isFooterVisible);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        navigation.navigate(item.screen);
        setMenuVisible(false);
      }}
    >
      <Text style={NewStyles.text10}>{item.title}</Text>
    </TouchableOpacity>
  );

  const FooterComponent = () => {
    if (!isFooterVisible) return null;

    return (
      <SafeAreaView edges={{top:'off', bottom:'additive'}}>
        <Modal
          transparent={true}
          visible={menuVisible}
          onRequestClose={() => {
            setMenuVisible(false);
          }}
          animationType="fade"
        >
          <TouchableWithoutFeedback
            onPress={() => {
              setMenuVisible(false);
            }}
          >
            <View style={styles.coverlist}>
              <View style={styles.coverlist2}>
                <FlatList
                  data={menuItems}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderItem}
                  style={{
                    height: '85%',
                    paddingVertical: 20,
                    paddingHorizontal: 16,
                  }}
                  showsVerticalScrollIndicator={false}
                />

                {/* دکمه‌های پایین */}
                <View style={styles.bottomButtons}>
                  <TouchableOpacity style={styles.toggleButton}>
                    <Text style={styles.toggleButtonText}>روشن / خاموش</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.exitButton}
                    onPress={() => {
                      setMenuVisible(false);
                      // Navigate to login or exit app
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Welcome' }],
                      });
                    }}
                  >
                    <Text style={styles.exitButtonText}>خروج</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <View style={[styles.footer, NewStyles.rowWrapper]}>
          <TouchableOpacity
            onPress={() => {
              Linking.openURL(`tel:02121164552`);
            }}
          >
            <Text style={NewStyles.text4}>21164552</Text>
          </TouchableOpacity>
          <Text style={NewStyles.text4}>فا</Text>
          <TouchableOpacity style={styles.supportButton}>
            <Text style={NewStyles.text4}>پشتیبانی</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.footerLogo}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };

  const value = {
    isFooterVisible,
    showFooter,
    hideFooter,
    toggleFooter,
    menuItems,
    setMenuItems,
    FooterComponent,
  };

  return (
    <FooterContext.Provider value={value}>
      {children}
    </FooterContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    resizeMode: 'cover',
    paddingTop: 60,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 5,
  },
  logo: {
    width: 160,
    height: 90,
    resizeMode: 'contain',
  },
  folderList: {
    flex: 1,
  },
  coverlist: {
    flex: 1,
    justifyContent: 'flex-end',
    alignSelf: 'flex-start',
    marginBottom: 60,
  },
  coverlist2: {
    height: '50%',
    backgroundColor: themeColor0.bgColor(0.9),
  },
  folderItem: {
    width: 80,
    alignItems: 'center',
    margin: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    width: '50%',
  },
  folderIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  folderText: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  footer: {
    backgroundColor: themeColor13.bgColor(1),
    width: '100%',
    paddingHorizontal: 15,
  },
  footerLogo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  supportButton: {
    backgroundColor: '#005b9f',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 5,
  },
  supportText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  language: {
    color: '#fff',
    fontSize: 16,
  },
  phone: {
    color: '#fff',
    fontSize: 16,
  },
  menuBox: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    padding: 10,
    width: '90%',
    maxHeight: '0%',
    marginBottom: 20,
  },
  menuScroll: {
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuText: {
    fontSize: 14,
    marginRight: 10,
    color: '#000',
  },
  list: {},
  item: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
  },
  title: {
    color: '#333',
    fontSize: 16,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 10,
    marginTop: 10,
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  exitButton: {
    backgroundColor: '#f44336',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  exitButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});