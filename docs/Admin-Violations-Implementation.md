# گزارش تخلفات ادمین - راهنمای پیاده‌سازی

## خلاصه پروژه

این فیچر به متخصصان امکان می‌دهد گزارش‌های تخلف ثبت شده توسط ادمین را مشاهده کنند و در صورت امکان به آن‌ها پاسخ دهند.

## فایل‌های تغییر یافته

### 1. `services/ApiEndpoints.js`
✅ **افزوده شد**: بخش `ADMIN_VIOLATIONS` با 3 endpoint:
- `LIST`: دریافت لیست گزارش‌ها
- `DETAIL`: دریافت جزئیات یک گزارش
- `REPLY`: ارسال پاسخ به گزارش

### 2. `services/Api.js`
✅ **افزوده شد**: 3 تابع جدید:
- `getAdminReportViolations()`: دریافت لیست کامل گزارش‌های تخلف
- `getAdminReportViolationById(reportId)`: دریافت جزئیات یک گزارش خاص
- `replyToAdminReportViolation(reportId, responseText)`: ارسال پاسخ به گزارش

**ویژگی‌های توابع:**
- احراز هویت خودکار با Bearer Token
- مدیریت خطاهای 400, 403, 404, 422
- Console logging برای debugging
- Validation اتوماتیک

### 3. `screens/performservice/LoopReportScreen.js`
✅ **بازنویسی کامل** با قابلیت‌های زیر:

**State Management:**
- `reports`: لیست گزارش‌ها
- `loading`: وضعیت بارگذاری
- `refreshing`: وضعیت refresh
- `selectedReport`: گزارش انتخاب شده
- `replyModalVisible`: نمایش modal پاسخ
- `replyText`: متن پاسخ کاربر
- `submittingReply`: وضعیت ارسال پاسخ
- `sortOrder`: ترتیب نمایش (جدید به قدیم / قدیم به جدید)

**قابلیت‌ها:**
- ✅ دریافت خودکار لیست گزارش‌ها در هنگام باز شدن صفحه
- ✅ Pull-to-refresh برای بروزرسانی
- ✅ مرتب‌سازی بر اساس تاریخ (جدیدترین/قدیمی‌ترین)
- ✅ نمایش وضعیت هر گزارش با رنگ‌بندی:
  - 🟠 نارنجی: در انتظار پاسخ
  - 🟢 سبز: پاسخ داده شده
  - ⚫ خاکستری: بدون امکان پاسخ
- ✅ نمایش پاسخ قبلی متخصص (در صورت وجود)
- ✅ Modal برای ارسال پاسخ با:
  - TextInput چند خطی
  - شمارنده کاراکتر (5000 max)
  - دکمه‌های انصراف و ارسال
  - Loading indicator هنگام ارسال
- ✅ Validation کامل:
  - بررسی خالی نبودن متن
  - بررسی حداکثر 5000 کاراکتر
  - جلوگیری از پاسخ مجدد
  - بررسی can_reply

### 4. `assets/locales/fa.json`
✅ **افزوده شد**: ترجمه‌های فارسی برای:
- عناوین و برچسب‌ها
- پیام‌های خطا
- وضعیت‌های مختلف
- دکمه‌ها

## نحوه استفاده

### دریافت لیست گزارش‌ها

```javascript
import { getAdminReportViolations } from '../../services/Api';

const fetchReports = async () => {
  try {
    const result = await getAdminReportViolations();
    if (result.success) {
      console.log('Reports:', result.data);
      console.log('Total:', result.total);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### دریافت جزئیات یک گزارش

```javascript
import { getAdminReportViolationById } from '../../services/Api';

const fetchReportDetail = async (reportId) => {
  try {
    const result = await getAdminReportViolationById(reportId);
    if (result.success) {
      console.log('Report Detail:', result.data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### ارسال پاسخ

```javascript
import { replyToAdminReportViolation } from '../../services/Api';

const submitReply = async (reportId, responseText) => {
  try {
    const result = await replyToAdminReportViolation(reportId, responseText);
    if (result.success) {
      console.log('Reply submitted successfully');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

## ساختار Response از API

### لیست گزارش‌ها

```json
{
  "success": true,
  "message": "لیست گزارش‌های تخلف با موفقیت دریافت شد.",
  "data": [
    {
      "id": 1,
      "title": "تأخیر در ارائه خدمات",
      "description": "شرح کامل تخلف...",
      "technician_response": null,
      "can_reply": 1,
      "has_response": false,
      "response_status_label": "در انتظار پاسخ",
      "created_at": "2025-11-09T10:00:00.000000Z",
      "updated_at": "2025-11-09T10:00:00.000000Z"
    }
  ],
  "total": 1
}
```

### پاسخ موفق به گزارش

```json
{
  "success": true,
  "message": "پاسخ شما با موفقیت ثبت شد.",
  "data": {
    "id": 1,
    "title": "تأخیر در ارائه خدمات",
    "technician_response": "متن پاسخ...",
    "can_reply": 1,
    "has_response": true,
    "response_status_label": "پاسخ داده شده"
  }
}
```

## مدیریت خطاها

### خطاهای احتمالی

| کد خطا | معنی | نحوه مدیریت |
|-------|------|-------------|
| 400 | قبلاً پاسخ داده شده | نمایش پیام و جلوگیری از ارسال مجدد |
| 403 | امکان پاسخ وجود ندارد | بررسی `can_reply` قبل از نمایش دکمه |
| 404 | گزارش یافت نشد | نمایش پیام خطا |
| 422 | اعتبارسنجی ناموفق | نمایش خطاهای validation |

### نمونه مدیریت خطا

```javascript
try {
  const result = await replyToAdminReportViolation(reportId, responseText);
  if (result.success) {
    showToastOrAlert('پاسخ با موفقیت ثبت شد');
  }
} catch (error) {
  if (error.message.includes('قبلاً پاسخ داده')) {
    showToastOrAlert('شما قبلاً به این گزارش پاسخ داده‌اید');
  } else if (error.message.includes('امکان پاسخ‌دهی')) {
    showToastOrAlert('امکان پاسخ به این گزارش وجود ندارد');
  } else {
    showToastOrAlert(error.message);
  }
}
```

## UI Components

### رنگ‌بندی وضعیت‌ها

```javascript
const getStatusColor = (report) => {
  if (!report.can_reply) return themeColor7.bgColor(0.8); // خاکستری
  if (report.has_response) return themeColor4.bgColor(0.8); // سبز
  return themeColor10.bgColor(0.8); // نارنجی
};
```

### کارت گزارش

هر کارت شامل:
- عنوان گزارش
- Badge وضعیت (رنگی)
- توضیحات کامل
- تاریخ ثبت
- پاسخ قبلی (در صورت وجود)
- دکمه پاسخ (در صورت امکان)

### Modal پاسخ

- TextInput چند خطی با حداکثر 5000 کاراکتر
- شمارنده زنده کاراکتر
- دکمه انصراف و ارسال
- Loading indicator هنگام submit

## تست‌های پیشنهادی

### ✅ تست‌های عملکردی

1. **بارگذاری لیست:**
   - باز کردن صفحه و بررسی دریافت لیست
   - Pull-to-refresh

2. **مرتب‌سازی:**
   - تغییر ترتیب جدید به قدیم
   - تغییر ترتیب قدیم به جدید

3. **نمایش جزئیات:**
   - کلیک روی هر گزارش
   - بررسی نمایش تمام اطلاعات

4. **ارسال پاسخ:**
   - باز کردن modal
   - وارد کردن متن (کمتر از 5000 کاراکتر)
   - ارسال موفق
   - بروزرسانی لیست

5. **Validation:**
   - تلاش برای ارسال پاسخ خالی
   - تلاش برای ارسال بیش از 5000 کاراکتر
   - تلاش برای پاسخ مجدد
   - تلاش برای پاسخ به گزارش غیرقابل پاسخ

### ⚠️ Edge Cases

- لیست خالی (بدون گزارش)
- خطای شبکه
- Token منقضی شده
- گزارش حذف شده
- همزمانی ارسال چند پاسخ

## نکات امنیتی

✅ **پیاده‌سازی شده:**
- احراز هویت با Bearer Token
- Validation سمت کلاینت و سرور
- محدودیت طول متن (5000 کاراکتر)
- جلوگیری از پاسخ مجدد
- بررسی مجوز پاسخ (`can_reply`)

## Performance

✅ **بهینه‌سازی‌ها:**
- فقط یک بار fetch در هنگام mount
- Pull-to-refresh برای بروزرسانی دستی
- مرتب‌سازی در حافظه (بدون API call اضافی)
- Lazy rendering با map

## مستندات API کامل

مستندات کامل API در فایل اصلی درخواست موجود است:
- تمام endpoints
- نمونه request/response
- کدهای خطا
- قوانین validation

## نتیجه‌گیری

✅ پیاده‌سازی کامل شده است با:
- 3 API endpoint
- UI کامل با Modal
- مدیریت خطای جامع
- Validation دقیق
- UX عالی با Loading states
- RTL support
- رنگ‌بندی وضعیت‌ها
- ترجمه فارسی کامل

🚀 آماده برای تست و استفاده در production
