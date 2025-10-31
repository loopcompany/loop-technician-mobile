# 🚨 CRITICAL: اصلاح فوری مورد نیاز در Backend

## ❌ مشکل تایید شده

API لاگین (`POST /api/technician/login`) **فقط 4 فیلد محدود** برمی‌گرداند:

```json
{
  "success": true,
  "data": {
    "token": "...",
    "token_info": {...},
    "technician": {
      "id": 123,
      "name": "علی احمدی",
      "phone": "09123456789",
      "referral_code": "ABC123"
    }
  }
}
```

## راه‌حل مورد نیاز

API لاگین باید **همه فیلدهای technician** که در زمان ثبت‌نام ذخیره شده‌اند را برگرداند:

```json
{
  "success": true,
  "data": {
    "token": "...",
    "token_info": {...},
    "technician": {
      "id": 123,
      "name": "علی احمدی",
      "phone": "09123456789",
      "referral_code": "ABC123",
      
      // ⬇️ این فیلدها باید اضافه شوند:
      "melicode": "1234567890",
      "birth_date": "1370/01/01",
      "email": "ali@example.com",
      "telephone": "02112345678",
      "mobile": "09123456789",
      "home_address": "تهران، خیابان...",
      "home_postal_code": "1234567890",
      "city": "تهران",
      "region": "5",
      
      // Vehicle info
      "vehicle_type": "car",
      "vehicle_plate": "12ط345-78",
      
      // Financial info
      "shaba_number": "IR123456789012345678901234",
      "card_number": "6037991234567890",
      "bank_name": "ملی",
      
      // Other fields
      "father_name": "حسن",
      "marital_status": "متاهل",
      "education_status": "لیسانس",
      "profile_photo_path": "/storage/photos/123.jpg",
      
      // ... و همه فیلدهای دیگر
    }
  }
}
```

## فایل‌هایی که نیاز به اصلاح دارند

### در Laravel Backend:

**فایل:** `app/Http/Controllers/Api/TechnicianAuthController.php` (یا مشابه)

**متد:** `login()`

**تغییر مورد نیاز:**

```php
// ❌ قبلی (فقط چند فیلد محدود)
'technician' => [
    'id' => $technician->id,
    'name' => $technician->name,
    'phone' => $technician->phone,
    'referral_code' => $technician->referral_code,
]

// ✅ صحیح (همه فیلدها)
'technician' => $technician->makeVisible([
    'id', 'name', 'phone', 'referral_code', 'melicode', 'birth_date',
    'email', 'telephone', 'mobile', 'home_address', 'home_postal_code',
    'city', 'region', 'vehicle_type', 'vehicle_plate', 'shaba_number',
    'card_number', 'bank_name', 'father_name', 'marital_status',
    'education_status', 'profile_photo_path', 'certificate_number',
    'certificate_expiry_date', 'certificate_issue_date', 'technician_type',
    'other_referral_code'
    // و همه فیلدهای دیگر که در ثبت‌نام دریافت می‌شوند
])

// یا ساده‌تر:
'technician' => $technician
```

## چرا این تغییر لازم است؟

1. کاربر وقتی ثبت‌نام می‌کند، همه اطلاعاتش رو وارد می‌کنه (اسم، ایمیل، آدرس، نوع وسیله و...)
2. بعد از لاگین، این اطلاعات باید توی صفحات **Personal Info**، **Vehicle Info**، و **Financial Info** نمایش داده بشه
3. فعلاً چون Backend فقط 4 فیلد محدود برمی‌گردونه، کاربر باید دوباره همه اطلاعاتش رو پر کنه! ❌

## تست API

بعد از اصلاح، لطفاً با Postman تست کنید:

```
POST /api/technician/login
{
  "referral_code": "ABC123",
  "password": "password123"
}
```

**Response باید شامل همه فیلدهای technician باشه.**

---

## 🔴 اولویت: CRITICAL

این مشکل باعث میشه:
1. ❌ کاربر بعد از ثبت‌نام و لاگین، اطلاعاتش رو نمی‌بینه
2. ❌ کاربر مجبور میشه دوباره همه اطلاعات رو وارد کنه
3. ❌ تجربه کاربری بسیار بد

## لاگ واقعی از Frontend:

```
userData موجود: {
  "technician": {
    "id": 15,
    "name": "نیلوصفری",
    "phone": "09303163846",
    "referral_code": "0A7E43B2"
  },
  "token": "48|...",
  "token_type": "Bearer"
}

فیلدهای technician: ["id", "name", "phone", "referral_code"]

مقادیر فیلدها: {
  "birth_date": undefined,
  "email": undefined,
  "home_address": undefined,
  "melicode": undefined,
  "phone": "09303163846",
  "telephone": undefined
}
```

**همه فیلدها undefined هستن به جز phone!**

---

## راه‌حل جایگزین (اگر نمی‌تونی Login رو تغییر بدی):

اگر endpoint `/api/technician/profile` (GET) داری که اطلاعات کامل رو برمی‌گردونه، اسمش رو بهم بگو تا Frontend رو اصلاح کنم که اونو صدا بزنه!
