# 🚀 راهنمای سریع اجرای پروژه

## اجرای Web App

```bash
# روش 1: استفاده از npm
npm start
# سپس 'w' را بزنید

# روش 2: مستقیم
npm run web

# روش 3: با Clear Cache
npx expo start -c --web
```

## مشکلات رایج و راه‌حل‌ها

### ✅ مشکلات حل شده:

1. **Back Button در مرورگر** ✓
   - Linking configuration اضافه شد
   - Browser history به درستی کار می‌کند
   - State persistence فقط برای native فعال است

2. **نقشه در وب** ✓
   - MapView.web.js برای پشتیبانی از Leaflet ساخته شد
   - CSS از CDN لود می‌شود
   - آیکون‌های marker به درستی نمایش داده می‌شوند

3. **Reload در موبایل** ✓
   - State persistence فقط در dev mode و native فعال است
   - در وب از browser history استفاده می‌شود

### مشکلات احتمالی:

#### پورت اشغال است
```bash
# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8081 | xargs kill -9
```

#### Cache خراب است
```bash
npx expo start -c
# یا
rm -rf node_modules .expo
npm install
```

## ویژگی‌های اضافه شده:

- ✅ Deep Linking برای تمام صفحات
- ✅ SEO-friendly URLs
- ✅ Browser History Support
- ✅ Leaflet Map برای وب
- ✅ React Native Maps برای موبایل
- ✅ State Persistence مدیریت شده

## لینک‌های مفید:

- [مستندات کامل](./WEB_APP_SETUP_GUIDE.md)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)

**✅ تمام مشکلات برطرف شد! پروژه آماده اجرا است.** 🎉
