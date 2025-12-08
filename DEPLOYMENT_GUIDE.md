# 🚀 راهنمای دپلوی وب‌اپ تکنسین

## ✅ چک‌لیست قبل از آپلود

1. ✅ تغییرات responsive اعمال شده است
2. ✅ فایل `postbuild.js` ایجاد شده است
3. ✅ اسکریپت build در `package.json` به‌روز شده است
4. ✅ فایل `.htaccess` در پوشه dist آماده است

## 🔨 ساخت بیلد جدید

```bash
# ساخت بیلد با اعمال خودکار تغییرات responsive
npm run build:web
```

این دستور:
1. بیلد وب را با Expo می‌سازد
2. به صورت خودکار `postbuild.js` را اجرا می‌کند
3. فایل `styles.css` را کپی می‌کند
4. `dist/index.html` را با تنظیمات responsive اصلاح می‌کند

## 📦 فایل‌های قابل آپلود

تمام محتویات پوشه `dist/` را به هاست خود آپلود کنید:

```
dist/
├── index.html          ✅ (فایل اصلی - اصلاح شده)
├── styles.css          ✅ (استایل‌های responsive)
├── .htaccess           ✅ (برای Apache)
├── favicon.ico
├── metadata.json
├── assets/             ✅ (تصاویر و فونت‌ها)
└── _expo/              ✅ (فایل‌های JavaScript)
```

## 🌐 آپلود به هاست

### روش 1: FTP
1. به هاست خود با FTP متصل شوید
2. پوشه `public_html` یا `www` را باز کنید
3. تمام محتویات `dist/` را آپلود کنید

### روش 2: cPanel File Manager
1. وارد cPanel شوید
2. File Manager را باز کنید
3. به `public_html` بروید
4. فایل‌های قدیمی را پاک کنید
5. تمام محتویات `dist/` را آپلود کنید

### روش 3: Git Deployment
```bash
# در پوشه dist
cd dist
git init
git add .
git commit -m "Deploy web app"
git push origin main
```

## ⚙️ پیکربندی سرور

### Apache (.htaccess)
فایل `.htaccess` از قبل در `dist/` آماده است.

### Nginx
اگر از Nginx استفاده می‌کنید، این تنظیمات را به config اضافه کنید:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

## 🧪 تست بعد از آپلود

1. **باز کردن در مرورگر:**
   - Desktop: Chrome, Firefox, Edge
   - Mobile: Chrome Mobile, Safari iOS

2. **تست‌های ضروری:**
   - ✅ سعی کنید zoom out کنید → **نباید بشود**
   - ✅ Pinch-to-zoom → **غیرفعال است**
   - ✅ Scroll افقی → **ندارد**
   - ✅ Background → **به محتوا چسبیده**
   - ✅ Navigation → **کار می‌کند**
   - ✅ فونت فارسی → **نمایش داده می‌شود**

3. **Hard Refresh:**
   - Windows: `Ctrl + F5`
   - Mac: `Cmd + Shift + R`
   - Mobile: Clear cache از تنظیمات

## 🐛 عیب‌یابی

### مشکل: هنوز می‌شود zoom کرد
**راه حل:**
```bash
# اجرای مجدد postbuild
node postbuild.js

# سپس فایل dist/index.html را دوباره آپلود کنید
```

### مشکل: فونت فارسی نمایش داده نمی‌شود
**راه حل:**
- مطمئن شوید پوشه `dist/assets/assets/fonts/` آپلود شده است
- فونت‌های Vazir باید موجود باشند

### مشکل: 404 هنگام Refresh
**راه حل:**
- فایل `.htaccess` را چک کنید (Apache)
- تنظیمات Nginx را بررسی کنید
- مطمئن شوید `index.html` در root است

### مشکل: Scroll افقی دارد
**راه حل:**
1. DevTools باز کنید (F12)
2. المان مشکل‌دار را پیدا کنید
3. با این دستور چک کنید:
```javascript
// در Console مرورگر
document.querySelectorAll('*').forEach(el => {
  if (el.scrollWidth > el.clientWidth) {
    console.log(el);
  }
});
```

### مشکل: CSS ها لود نمی‌شوند
**راه حل:**
- مطمئن شوید `styles.css` در root پوشه dist است
- لینک در `index.html` را چک کنید: `<link rel="stylesheet" href="/styles.css" />`

## 🔄 آپدیت کردن اپ

هر بار که تغییری دادید:

```bash
# 1. کد را تغییر دهید
# 2. بیلد بگیرید
npm run build:web

# 3. فایل‌های جدید dist را آپلود کنید
```

## 📱 تست روی موبایل

### روش 1: استفاده از ngrok
```bash
# نصب ngrok
npm install -g ngrok

# در پوشه dist
npx http-server -p 8080

# در ترمینال دیگر
ngrok http 8080
```

### روش 2: استفاده از IP محلی
```bash
# در پوشه dist
npx http-server -p 8080

# سپس از موبایل به این آدرس بروید:
# http://YOUR_LOCAL_IP:8080
```

## 📊 بهینه‌سازی

### کاهش حجم بیلد
```bash
# حذف فایل‌های غیرضروری از dist/assets
# حذف sourcemaps (اگر نیاز ندارید)
```

### فشرده‌سازی
```bash
# فشرده‌سازی فایل‌های JavaScript
# این کار توسط Expo انجام می‌شود
```

## 🔐 امنیت

فایل `.htaccess` شامل تنظیمات امنیتی:
- X-Frame-Options: جلوگیری از clickjacking
- X-Content-Type-Options: جلوگیری از MIME sniffing

برای امنیت بیشتر:
```apache
# اضافه کردن به .htaccess
Header always set Content-Security-Policy "default-src 'self'"
Header always set X-XSS-Protection "1; mode=block"
```

## 📞 پشتیبانی

اگر مشکلی پیش آمد:
1. لاگ‌های Console مرورگر را بررسی کنید
2. Network tab را در DevTools چک کنید
3. مطمئن شوید تمام فایل‌ها آپلود شده‌اند

**موفق باشید!** 🎉
