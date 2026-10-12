# تغییرات بک‌اند «امنیت حساب» اپ تکنسین — مرحلهٔ دوم

تاریخ: ۱۴۰۵/۰۷/۲۰

این سند فقط تغییرات **جدید** را می‌گوید. پایهٔ امنیت حساب (دستگاه‌ها، نشست‌ها، خروج از سایر دستگاه‌ها) قبلاً پیاده و منتشر شده است.

## خلاصه

| # | تغییر | Endpoint | نوع کار |
|---|---|---|---|
| ۱ | فیلد `device_name` (نام تجاری دستگاه) | `GET /api/technician/security/devices` و `GET /api/technician/security/sessions` | فیلد جدید در پاسخ |
| ۲ | پر کردن فیلد `location` (موقعیت تقریبی) | `GET /api/technician/security/devices` | فیلد موجود، الان همیشه `null` است |
| ۳ | درست کردن پیام‌های فارسی خراب | `POST /api/technician/logout` و `POST /api/technician/logout-all` | اصلاح متن |

- **endpoint جدیدی لازم نیست.**
- اپ برای هر سه مورد آماده است. تا وقتی فیلدها فرستاده نشوند (یا `null` باشند)، اپ مثل قبل کار می‌کند. پس ترتیب انتشار اپ و بک‌اند مهم نیست.

---

## ۱. فیلد `device_name`: نام تجاری دستگاه

### مشکل

سند امنیت حساب نمونهٔ «Samsung Galaxy A22» را آورده است. اما اندروید فقط کد مدل را می‌دهد (`device_model: "SM-A225F"`)، پس اپ الان «Samsung SM-A225F» نشان می‌دهد.

### قرارداد

| Endpoint | محل فیلد |
|---|---|
| `GET /api/technician/security/devices` | `data.devices[].device_name` |
| `GET /api/technician/security/sessions` | `data.sessions[].device_name` |

- **نوع:** `string | null`
- **مقدار:** فقط نام تجاری و **بدون برند**، مثل `"Galaxy A22"` یا `"Redmi Note 11"`. اپ برند را از `device_brand` اضافه می‌کند. اگر برند را هم بفرستید، اپ آن را تکرار نمی‌کند.
- اگر نام تجاری پیدا نشد: `null`.
- بقیهٔ فیلدها، از جمله `device_model`، دست نخورند.

نمونه:

```json
{
  "id": "android-m1k2x9-ab12cd34ef56gh78",
  "device_brand": "samsung",
  "device_model": "SM-A225F",
  "device_name": "Galaxy A22",
  "...": "بقیهٔ فیلدها مثل قبل"
}
```

### اپ چه نشان می‌دهد

| | بدون `device_name` | با `device_name` |
|---|---|---|
| عنوان کارت | Samsung SM-A225F | Samsung Galaxy A22 |
| ردیف «مدل دستگاه» | SM-A225F | Galaxy A22 (SM-A225F) |

### پیشنهاد پیاده‌سازی

1. **منبع داده:** فهرست رسمی Google Play با ستون‌های `Retail Branding, Marketing Name, Device, Model`:
   `https://storage.googleapis.com/play_public/supported_devices.csv` (فایل UTF-16 است).
2. **جدول:** مثلاً `device_marketing_names(model, brand, marketing_name)` با index روی `model`. یک command (مثلاً `php artisan devices:import-names`) CSV را import یا به‌روز می‌کند.
3. **جستجو:** بر اساس `device_model`، بدون حساسیت به حروف بزرگ و کوچک. اگر برای یک مدل چند ردیف بود، اولی کافی است. اگر `Marketing Name` با برند شروع شد، برند را حذف کنید یا همان‌طور بفرستید؛ اپ هر دو حالت را درست نشان می‌دهد.
4. **ذخیره:** یک بار هنگام ثبت دستگاه، یعنی ورود و `AccountSessionService::attachDevice` (که `PUT /technician/security/current-device` هم از آن استفاده می‌کند)، در ستون جدید `personal_access_tokens.device_name` (`string(100) nullable`). در هر درخواست محاسبه نشود.
5. **توکن‌های موجود:** یا یک بار backfill کنید، یا صبر کنید. اپ در هر اجرا یک بار `PUT current-device` می‌فرستد و خودشان پر می‌شوند.
6. **iOS:** لازم نیست، چون `device_model` خودش `"iPhone 13"` است. `device_name: null` کافی است.

---

## ۲. فیلد `location`: موقعیت تقریبی

### قرارداد

| Endpoint | محل فیلد |
|---|---|
| `GET /api/technician/security/devices` | `data.devices[].location` |

- فیلد الان در پاسخ هست ولی همیشه `null` است. فقط مقدارش باید پر شود.
- **نوع:** `string | null`
- **مقدار:** یک رشتهٔ آماده برای نمایش، ترجیحاً فارسی، مثل `"تهران، ایران"` یا `"مشهد، ایران"`. اگر نام فارسی در دسترس نیست، انگلیسی (`"Tehran, Iran"`) هم قابل قبول است.
- اپ رشته را بدون تغییر در ردیف «موقعیت تقریبی» نشان می‌دهد. اگر `null` یا خالی باشد، آن ردیف نشان داده نمی‌شود.

### پیشنهاد پیاده‌سازی

- **روش:** از روی `last_ip` با یک دیتابیس GeoIP **محلی** (مثلاً MaxMind GeoLite2-City)، تا برای هر درخواست سرویس بیرونی صدا زده نشود.
- **زمان محاسبه:** فقط وقتی `last_ip` عوض می‌شود، یعنی در middleware `TrackTokenActivity` و در `attachDevice`.
- **ذخیره:** در ستون جدید `personal_access_tokens.last_location` (`string(150) nullable`). در پاسخ با نام `location` برگردد.
- **IP خصوصی یا رزرو** (`10.x`، `192.168.x`، `127.x` و…) یا وقتی چیزی پیدا نشد: `null`.

---

## ۳. پیام‌های فارسی خراب در `TechnicianRegistrationController.php`

در `app/Http/Controllers/TechnicianRegistrationController.php`، متدهای `logout` و `logoutFromAllDevices` پیام‌هایشان در خود فایل به `'?????'` تبدیل شده‌اند (حدود خطوط ۱۹۰، ۲۰۹، ۲۲۹ و ۲۴۸، و بقیهٔ پیام‌های خطای همین دو متد).

| Endpoint | حالت | متن پیشنهادی |
|---|---|---|
| هر دو | `UNAUTHORIZED` | `کاربر احراز هویت نشده است.` |
| `POST /api/technician/logout` | موفق | `خروج با موفقیت انجام شد.` |
| `POST /api/technician/logout-all` | موفق | `خروج از همه دستگاه‌ها با موفقیت انجام شد.` |
| هر دو | `LOGOUT_ERROR` | `خطا در خروج. لطفاً دوباره تلاش کنید.` |

فایل حتماً با UTF-8 ذخیره شود.

---

## ۴. چک‌لیست تست

- [ ] migration ستون‌های `device_name` و `last_location` اجرا شده است.
- [ ] ورود با گوشی سامسونگ: در `GET devices`، `device_name` مثلاً `"Galaxy A22"` است. اپ «Samsung Galaxy A22» و «Galaxy A22 (SM-A225F)» نشان می‌دهد.
- [ ] همین مقدار در `GET sessions` هم برمی‌گردد.
- [ ] مدلی که در فهرست نیست: `device_name: null` و اپ مثل قبل «Samsung SM-XXXX» نشان می‌دهد.
- [ ] نشستی که قبل از تغییر ساخته شده، بعد از باز کردن دوبارهٔ اپ `device_name` می‌گیرد.
- [ ] `location` برای IP ایرانی پر است و ردیف «موقعیت تقریبی» در اپ دیده می‌شود.
- [ ] برای IP محلی یا ناشناخته `location: null` است و ردیف نمایش داده نمی‌شود.
- [ ] پاسخ `POST /api/technician/logout` و `POST /api/technician/logout-all` پیام فارسی سالم دارد.
