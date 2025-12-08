# 🔧 رفع مشکل Zoom در Development Mode

## مشکل
در حالت development (`expo start --web`)، هنوز می‌شود zoom کرد حتی با تنظیمات viewport.

## علت
Expo در development mode ممکن است تنظیمات viewport را override کند یا cache کند.

## راه‌حل‌ها

### ✅ راه‌حل 1: Clear Cache و Restart
```bash
# بستن expo (اگر در حال اجراست)
Ctrl + C

# شروع با clear cache
npx expo start -c --web
```

سپس در مرورگر:
- **Hard Refresh**: `Ctrl + Shift + R` (Windows) یا `Cmd + Shift + R` (Mac)
- یا باز کردن در **Incognito/Private mode**

---

### ✅ راه‌حل 2: تست بیلد نهایی
بیلد نهایی همیشه درست کار می‌کند:

```bash
# ساخت بیلد
npm run build:web

# سرو کردن بیلد
npm run serve:dist

# باز کردن در مرورگر
http://localhost:8080
```

---

### ✅ راه‌حل 3: تست سریع با فایل HTML
```bash
# باز کردن فایل تست
npm run test:zoom
```

این فایل تست مستقل است و viewport را به درستی اعمال می‌کند.

---

## چک‌لیست رفع مشکل

اگر هنوز می‌توانید zoom کنید:

- [ ] Expo را با `-c` restart کردید؟
- [ ] در مرورگر Hard Refresh کردید؟ (`Ctrl + Shift + R`)
- [ ] Cache مرورگر را پاک کردید؟ (`F12 -> Application -> Clear storage`)
- [ ] در Incognito mode تست کردید؟
- [ ] بیلد نهایی را تست کردید؟ (`npm run serve:dist`)
- [ ] فایل `test-zoom.html` را باز کردید؟

---

## تنظیمات اعمال شده

### 1. `app.json`
```json
"web": {
  "meta": {
    "viewport": "width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover"
  }
}
```

### 2. `web/index.html`
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover" />
```

### 3. `dist/index.html`
همین تنظیمات + لینک به `styles.css`

### 4. `web/styles.css` و `dist/styles.css`
```css
html {
  touch-action: manipulation;
  -webkit-text-size-adjust: 100%;
}
```

---

## تفاوت Development vs Production

| جنبه | Development (expo start --web) | Production (dist/) |
|------|-------------------------------|-------------------|
| Viewport | ممکن است cache شود | همیشه درست |
| CSS | Hot reload دارد | Static |
| Cache | زیاد | کنترل‌پذیر |
| سرعت | سریع‌تر | کمی کندتر |

---

## نکات مهم

1. **Development Mode**: برای توسعه راحت است اما ممکن است zoom را کامل disable نکند
2. **Production Build**: همیشه viewport را درست اعمال می‌کند
3. **Cache**: بزرگترین دشمن! همیشه clear کنید
4. **Hard Refresh**: بهترین راه برای مطمئن شدن

---

## دستورات مفید

```bash
# Development با clear cache
npx expo start -c --web

# Production build
npm run build:web

# سرو بیلد
npm run serve:dist

# تست zoom
npm run test:zoom

# Clear cache Expo کامل
npx expo start -c
```

---

## عیب‌یابی پیشرفته

### در Console مرورگر:
```javascript
// چک کردن viewport
document.querySelector('meta[name="viewport"]').content

// چک کردن CSS
getComputedStyle(document.documentElement).touchAction

// چک کردن zoom
window.devicePixelRatio
```

### بررسی HTML source:
```
View Page Source (Ctrl + U)
```
مطمئن شوید viewport tag درست است.

---

## خلاصه

✅ **برای Development**: Clear cache + Hard refresh  
✅ **برای Production**: بیلد + serve  
✅ **برای تست سریع**: `test-zoom.html`

**یادآوری**: Cache همیشه مشکل‌ساز است! 🔄
