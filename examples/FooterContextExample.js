// مثال نحوه استفاده از FooterContext در screen ها
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useFooter } from '../contexts/FooterContext';
import { themeColor0, themeColor1, themeColor10, themeColor4, themeColor6, themeColor7 } from '../theme/Color';

export default function ExampleScreen({ navigation }) {
  const { 
    showFooter, 
    hideFooter, 
    isFooterVisible, 
    toggleFooter,
    setMenuItems 
  } = useFooter();

  // مثال: مخفی کردن Footer در صفحات خاص
  useEffect(() => {
    // Footer را در این صفحه مخفی کن
    hideFooter();
    
    // وقتی کاربر از صفحه خارج می‌شود، Footer را نمایش بده
    return () => {
      showFooter();
    };
  }, []);

  // مثال: تغییر آیتم‌های منو برای صفحه خاص
  const handleCustomizeMenu = () => {
    setMenuItems([
      { id: 1, title: 'آیتم سفارشی 1', screen: 'CustomScreen1' },
      { id: 2, title: 'آیتم سفارشی 2', screen: 'CustomScreen2' },
    ]);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>مثال استفاده از Footer Context</Text>
      
      <TouchableOpacity 
        style={{ backgroundColor: themeColor0.bgColor(1), padding: 10, margin: 10 }}
        onPress={showFooter}
      >
        <Text style={{ color: themeColor4.bgColor(1) }}>نمایش Footer</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={{ backgroundColor: themeColor6.bgColor(1), padding: 10, margin: 10 }}
        onPress={hideFooter}
      >
        <Text style={{ color: themeColor4.bgColor(1) }}>مخفی کردن Footer</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={{ backgroundColor: themeColor7.bgColor(1), padding: 10, margin: 10 }}
        onPress={toggleFooter}
      >
        <Text style={{ color: themeColor4.bgColor(1) }}>تغییر وضعیت Footer</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={{ backgroundColor: themeColor1.bgColor(1), padding: 10, margin: 10 }}
        onPress={handleCustomizeMenu}
      >
        <Text style={{ color: themeColor10.bgColor(1) }}>سفارشی کردن منوی Footer</Text>
      </TouchableOpacity>

      <Text>وضعیت فعلی Footer: {isFooterVisible ? 'نمایش داده شده' : 'مخفی'}</Text>
    </View>
  );
}