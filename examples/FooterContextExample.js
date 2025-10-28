// مثال نحوه استفاده از FooterContext در screen ها
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useFooter } from '../contexts/FooterContext';

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
        style={{ backgroundColor: '#007bff', padding: 10, margin: 10 }}
        onPress={showFooter}
      >
        <Text style={{ color: 'white' }}>نمایش Footer</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={{ backgroundColor: '#dc3545', padding: 10, margin: 10 }}
        onPress={hideFooter}
      >
        <Text style={{ color: 'white' }}>مخفی کردن Footer</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={{ backgroundColor: '#28a745', padding: 10, margin: 10 }}
        onPress={toggleFooter}
      >
        <Text style={{ color: 'white' }}>تغییر وضعیت Footer</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={{ backgroundColor: '#ffc107', padding: 10, margin: 10 }}
        onPress={handleCustomizeMenu}
      >
        <Text style={{ color: 'black' }}>سفارشی کردن منوی Footer</Text>
      </TouchableOpacity>

      <Text>وضعیت فعلی Footer: {isFooterVisible ? 'نمایش داده شده' : 'مخفی'}</Text>
    </View>
  );
}