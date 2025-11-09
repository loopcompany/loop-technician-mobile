# سیستم چت متخصص - مستندات پیاده‌سازی

## 📋 خلاصه تغییرات

سیستم چت برای اپلیکیشن متخصص پیاده‌سازی شد. این سیستم به متخصصان امکان می‌دهد با کاربرانی که سفارش فعال دارند، ارتباط برقرار کنند.

---

## 📁 فایل‌های ایجاد/ویرایش شده

### فایل‌های جدید:
1. **`screens/chat/ChatListScreen.js`** - صفحه لیست چت‌ها با کاربران

### فایل‌های ویرایش شده:
1. **`services/Api.js`** - اضافه شدن 4 API function:
   - `getTechnicianChats()` - دریافت لیست چت‌ها
   - `getTechnicianChatMessages(userId)` - دریافت پیام‌های یک چت
   - `sendTechnicianMessage(userId, message)` - ارسال پیام
   - `markTechnicianMessagesAsRead(userId)` - علامت‌گذاری به عنوان خوانده شده

2. **`screens/chat/ChatItem.js`** - تبدیل از نمایش متخصص به نمایش کاربر:
   - `item.technician` → `item.user`
   - `item.is_read` → `item.unread_count`
   - نمایش "شما: " برای پیام‌های متخصص

3. **`screens/chat/ChatRoom.js`** - تبدیل API calls از axios به Api.js:
   - استفاده از `getTechnicianChatMessages`
   - استفاده از `sendTechnicianMessage`
   - استفاده از `markTechnicianMessagesAsRead`
   - تغییر `technicianId` به `userId`
   - افزایش maxLength از 800 به 5000 کاراکتر
   - اضافه شدن auto-refresh هر 5 ثانیه

4. **`screens/chat/MessegeItem.js`** - تغییر منطق نمایش:
   - `is_user=1` (پیام کاربر) → سمت چپ
   - `is_user=0` (پیام متخصص) → سمت راست

5. **`screens/performservice/OrderDetailScreen.js`** - اضافه شدن دکمه چت:
   - دکمه "گفتگو با کاربر" بعد از بخش جزئیات سفارش
   - نمایش فقط در صورت وجود `user_id`

6. **`screens/FolderScreen.js`** - اضافه شدن آیتم منو:
   - آیتم جدید: "چت با کاربران" با screen `ChatListScreen`

7. **`App.js`** - اضافه شدن route های جدید:
   - `ChatListScreen`
   - `ChatRoom`

---

## 🎯 ویژگی‌های پیاده‌سازی شده

### 1. لیست چت‌ها (ChatListScreen)
✅ نمایش تمام چت‌های متخصص با کاربران  
✅ نمایش آخرین پیام هر چت  
✅ نمایش تعداد پیام‌های خوانده نشده (badge قرمز)  
✅ نمایش نام کاربر و عکس پروفایل  
✅ Pull-to-refresh برای به‌روزرسانی  
✅ نمایش تعداد کل پیام‌های خوانده نشده در عنوان صفحه  
✅ نمایش پیام خالی در صورت نبود چت  
✅ رفرش خودکار هنگام بازگشت به صفحه (useFocusEffect)  

### 2. جزئیات چت (ChatRoom)
✅ نمایش تمام پیام‌های رد و بدل شده  
✅ تمایز بصری بین پیام‌های متخصص و کاربر  
✅ ارسال پیام جدید با دکمه ارسال  
✅ نمایش loader هنگام ارسال  
✅ غیرفعال شدن ارسال برای چت‌های بسته شده  
✅ Pull-to-refresh برای بارگذاری مجدد  
✅ رفرش خودکار هر 5 ثانیه  
✅ علامت‌گذاری خودکار پیام‌ها به عنوان خوانده شده  
✅ حداکثر 5000 کاراکتر برای هر پیام  
✅ نمایش پیام خطا برای چت‌های بسته  

### 3. نقاط ورود به چت
✅ از منوی اصلی (FolderScreen) → "چت با کاربران"  
✅ از صفحه جزئیات سفارش → دکمه "گفتگو با کاربر"  

---

## 🔗 API Endpoints استفاده شده

### Base URL
```
https://your-domain.com/api/technician/chats
```

### Endpoints:
1. **GET `/technician/chats`** - لیست چت‌ها
2. **GET `/technician/chats/messages?user_id={id}`** - پیام‌های یک چت
3. **POST `/technician/chats/send`** - ارسال پیام
4. **POST `/technician/chats/mark-read`** - خوانده شده

---

## 📊 ساختار داده

### Chat Object (لیست چت‌ها)
```javascript
{
  id: 145,
  user_id: 23,
  technician_id: 5,
  msg: "آخرین پیام",
  is_user: 1,              // 1=کاربر، 0=متخصص
  is_read: 0,
  is_closed: 0,            // 1=بسته، 0=باز
  created_at: "2025-11-08T14:30:25.000000Z",
  user: {
    id: 23,
    name: "علی احمدی",
    phone: "09123456789",
    profile_photo: "path/to/photo.jpg"
  },
  unread_count: 2          // تعداد پیام خوانده نشده
}
```

### Message Object (پیام‌های چت)
```javascript
{
  id: 145,
  user_id: 23,
  technician_id: 5,
  msg: "متن پیام",
  is_user: 1,              // 1=از کاربر، 0=از متخصص
  is_read: 0,
  is_closed: 0,
  created_at: "2025-11-08T14:30:25.000000Z"
}
```

---

## 🎨 UI/UX تغییرات

### رنگ‌بندی:
- **پیام کاربر** (سمت چپ): `themeColor0.bgColor(0.5)` - آبی کم‌رنگ
- **پیام متخصص** (سمت راست): `themeColor3.bgColor(0.1)` - خاکستری روشن
- **Badge پیام خوانده نشده**: `themeColor6.bgColor(1)` - قرمز
- **دکمه ارسال**: `themeColor0.bgColor(1)` - آبی
- **چت بسته شده**: `themeColor6.bgColor(1)` - قرمز

### آیکون‌ها:
- **لیست چت‌ها**: بدون آیکون خاص
- **دکمه چت در OrderDetail**: `chatbubble-ellipses-outline`
- **ارسال پیام**: `paper-plane-outline`
- **چت بسته**: `close`

---

## 🔄 جریان کار (Flow)

### سناریو 1: مشاهده لیست چت‌ها
```
FolderScreen → کلیک "چت با کاربران" 
→ ChatListScreen (نمایش لیست) 
→ کلیک روی یک چت 
→ ChatRoom (نمایش پیام‌ها)
```

### سناریو 2: چت از صفحه سفارش
```
OrderListScreen → کلیک روی سفارش 
→ OrderDetailScreen → کلیک "گفتگو با کاربر" 
→ ChatRoom (نمایش پیام‌ها با آن کاربر)
```

### سناریو 3: ارسال پیام
```
ChatRoom → نوشتن پیام 
→ کلیک دکمه ارسال 
→ API call به sendTechnicianMessage 
→ رفرش لیست پیام‌ها 
→ پاک شدن اینپوت
```

---

## ⚠️ نکات مهم

### 1. Auto-Refresh
- **ChatListScreen**: رفرش فقط با pull-to-refresh یا هنگام بازگشت به صفحه
- **ChatRoom**: رفرش خودکار هر 5 ثانیه + pull-to-refresh

### 2. پیام‌های خوانده شده
- بعد از ورود به `ChatRoom`، تمام پیام‌های کاربر خودکار خوانده می‌شوند
- `markTechnicianMessagesAsRead` بدون نمایش خطا اجرا می‌شود (silent error)

### 3. چت‌های بسته شده
- چت فقط برای سفارشات فعال (status 0 یا 1) باز است
- در صورت بسته بودن، دکمه ارسال غیرفعال می‌شود
- پیام خطای 403 نمایش داده می‌شود

### 4. حداکثر طول پیام
- قبلاً: 800 کاراکتر
- حالا: **5000 کاراکتر** (مطابق API)

### 5. Navigation
- از `ChatRoom` به `ChatListScreen` با دکمه Back برمی‌گردیم
- از `ChatListScreen` به `FolderScreen` با دکمه Back برمی‌گردیم

---

## 🐛 مدیریت خطاها

### خطاهای مدیریت شده:
1. ✅ **403 Forbidden** - چت بسته شده است
2. ✅ **401 Unauthorized** - توکن نامعتبر
3. ✅ **Network Error** - مشکل اتصال
4. ✅ **500 Server Error** - خطای سرور
5. ✅ **Empty Response** - پاسخ خالی از API

### نمایش خطاها:
- از `showToastOrAlert` برای نمایش پیام‌های خطا استفاده می‌شود
- خطاهای critical لاگ می‌شوند
- خطاهای silent (مثل mark-read) نادیده گرفته می‌شوند

---

## 🧪 تست‌های پیشنهادی

### 1. تست عملکردی:
- [ ] ورود به لیست چت‌ها از منو
- [ ] ورود به چت از صفحه سفارش
- [ ] نمایش صحیح لیست چت‌ها
- [ ] نمایش صحیح badge پیام‌های خوانده نشده
- [ ] ارسال پیام جدید
- [ ] رفرش با pull-to-refresh
- [ ] رفرش خودکار هر 5 ثانیه
- [ ] نمایش پیام خطا برای چت بسته
- [ ] تمایز بصری پیام‌های متخصص و کاربر

### 2. تست Edge Cases:
- [ ] لیست چت‌ها خالی
- [ ] چت بدون پیام
- [ ] ارسال پیام بدون متن
- [ ] ارسال پیام خیلی طولانی (>5000 کاراکتر)
- [ ] قطع اینترنت حین ارسال پیام
- [ ] چت بسته شده

### 3. تست Performance:
- [ ] سرعت بارگذاری لیست چت‌ها
- [ ] سرعت بارگذاری پیام‌ها
- [ ] مصرف حافظه با auto-refresh
- [ ] Scroll performance در چت‌های طولانی

---

## 📈 بهبودهای آینده (Future Enhancements)

### نسخه 2.0:
1. 🔔 **Push Notifications** - اعلان برای پیام‌های جدید
2. 🎤 **Voice Messages** - ارسال پیام صوتی
3. 📸 **Image Sharing** - ارسال تصویر
4. 📍 **Location Sharing** - اشتراک‌گذاری موقعیت
5. ⌨️ **Typing Indicator** - نمایش "در حال تایپ..."
6. ✓✓ **Read Receipts** - تیک دوتایی برای خوانده شده
7. 🔍 **Search Messages** - جستجو در پیام‌ها
8. 📌 **Pin Chats** - سنجاق کردن چت‌های مهم
9. 🗑️ **Delete Messages** - حذف پیام
10. 📊 **Chat Analytics** - آمار و تحلیل چت‌ها

### بهبود Performance:
- استفاده از **WebSocket** به جای polling
- استفاده از **React.memo** برای بهینه‌سازی render
- **Pagination** برای پیام‌های قدیمی
- **Local Caching** با AsyncStorage

---

## 📞 پشتیبانی

در صورت بروز مشکل:
1. لاگ‌های Console را بررسی کنید
2. وضعیت توکن را چک کنید
3. اتصال اینترنت را بررسی کنید
4. نسخه اپلیکیشن را آپدیت کنید

---

**تاریخ پیاده‌سازی:** 8 نوامبر 2025  
**نسخه:** 1.0.0  
**توسعه‌دهنده:** GitHub Copilot
