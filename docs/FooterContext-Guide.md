# Footer Context - راهنمای استفاده

Footer به یک Context تبدیل شد و حالا در سطح `App.js` مدیریت می‌شود. این تغییر امکانات زیر را فراهم می‌کند:

## ویژگی‌های جدید:

### 1. **مدیریت Global Footer**
- Footer در سطح App.js قرار دارد
- در تمام صفحات به صورت خودکار نمایش داده می‌شود
- نیازی به import کردن Footer در هر صفحه نیست

### 2. **کنترل دینامیک نمایش**
```javascript
import { useFooter } from '../contexts/FooterContext';

const { showFooter, hideFooter, toggleFooter, isFooterVisible } = useFooter();

// نمایش Footer
showFooter();

// مخفی کردن Footer
hideFooter();

// تغییر وضعیت Footer
toggleFooter();

// چک کردن وضعیت
console.log(isFooterVisible); // true/false
```

### 3. **سفارشی‌سازی منوی Footer**
```javascript
const { setMenuItems } = useFooter();

// تغییر آیتم‌های منو برای صفحه خاص
setMenuItems([
  { id: 1, title: 'آیتم جدید', screen: 'NewScreen' },
  { id: 2, title: 'آیتم دیگر', screen: 'AnotherScreen' },
]);
```

## نحوه استفاده در صفحات:

### مثال 1: مخفی کردن Footer در صفحات خاص
```javascript
import React, { useEffect } from 'react';
import { useFooter } from '../contexts/FooterContext';

export default function LoginScreen() {
  const { hideFooter, showFooter } = useFooter();

  useEffect(() => {
    // Footer را در صفحه لاگین مخفی کن
    hideFooter();
    
    // وقتی از صفحه خارج می‌شود، Footer را نمایش بده
    return () => showFooter();
  }, []);

  return (
    // صفحه لاگین بدون Footer
  );
}
```

### مثال 2: تغییر منوی Footer برای صفحه خاص
```javascript
import React, { useEffect } from 'react';
import { useFooter } from '../contexts/FooterContext';

export default function AdminScreen() {
  const { setMenuItems } = useFooter();

  useEffect(() => {
    // منوی خاص برای ادمین
    setMenuItems([
      { id: 1, title: 'پنل مدیریت', screen: 'AdminPanel' },
      { id: 2, title: 'گزارشات', screen: 'Reports' },
      { id: 3, title: 'تنظیمات', screen: 'Settings' },
    ]);

    // بازگرداندن منوی اصلی هنگام خروج
    return () => {
      setMenuItems([
        { id: 1, title: ' سازمانی / شرکتی', screen: 'DeviceOrderSummary' },
        { id: 2, title: ' ثبت نام دوره های آموزشی ', screen: 'CorporateScreen' },
        // ... آیتم‌های پیش‌فرض
      ]);
    };
  }, []);

  return (
    // صفحه ادمین با منوی سفارشی
  );
}
```

## مزایای این پیاده‌سازی:

### ✅ **Clean Architecture**
- کد تمیزتر و سازمان‌یافته‌تر
- حذف تکرار import Footer در هر صفحه
- مدیریت متمرکز UI component

### ✅ **Performance**
- Footer فقط یک بار render می‌شود
- بهبود performance در navigation
- کاهش memory usage

### ✅ **Flexibility**
- امکان کنترل دینامیک نمایش Footer
- سفارشی‌سازی منو برای صفحات مختلف
- مدیریت ساده state های Footer

### ✅ **Maintainability**
- تغییرات Footer فقط در یک جا
- آسان‌تر برای debug کردن
- قابلیت تست بهتر

## مهاجرت از کد قبلی:

### قبل از تغییر:
```javascript
import Footer from './Footer';

export default function SomeScreen() {
  return (
    <View>
      {/* محتوای صفحه */}
      <Footer />
    </View>
  );
}
```

### بعد از تغییر:
```javascript
import { useFooter } from '../contexts/FooterContext';

export default function SomeScreen() {
  // اختیاری: کنترل Footer
  const { hideFooter, showFooter } = useFooter();

  return (
    <View>
      {/* محتوای صفحه */}
      {/* Footer خودکار نمایش داده می‌شود */}
    </View>
  );
}
```

## نکات مهم:

1. **FooterProvider** باید در بالاترین سطح App.js قرار گیرد
2. تمام صفحاتی که نیاز به Footer دارند باید داخل NavigationContainer باشند
3. برای صفحاتی که Footer نمی‌خواهند، از `hideFooter()` استفاده کنید
4. همیشه در cleanup function، Footer را به حالت اصلی برگردانید

این پیاده‌سازی منعطف‌ترین و قابل نگهداری‌ترین راه برای مدیریت Footer در اپلیکیشن است.