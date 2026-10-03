# تغییرات لازم در بک‌اند برای «امنیت حساب» اپ تکنسین

**مخاطب:** تیم بک‌اند (پروژهٔ `backend-laravel`، Laravel 12 + Sanctum 4)
**مرجع:** سند «فیلد امنیت حساب در اپ تکنسین» (۱۴۰۵/۰۷)
**وضعیت اپ:** سمت اپ کامل پیاده شده و منتظر همین API‌هاست. تا وقتی این API‌ها نباشند، صفحه‌های امنیت حساب پیام «این قابلیت هنوز روی سرور فعال نشده است» نشان می‌دهند و بقیهٔ اپ عادی کار می‌کند.

---

## خلاصه

| # | کار | فایل |
|---|---|---|
| 1 | افزودن ستون‌های دستگاه به `personal_access_tokens` | Migration جدید |
| 2 | پذیرفتن اطلاعات دستگاه در ورود | `app/Http/Requests/TechnicianLoginRequest.php` |
| 3 | ثبت اطلاعات دستگاه روی توکن هنگام ورود + حذف توکن قبلی همان دستگاه | `TechnicianRegistrationController::login` و `TechnicianRegistrationService::login` |
| 4 | به‌روزرسانی «IP آخرین اتصال» در هر درخواست | Middleware جدید + `bootstrap/app.php` |
| 5 | شش API جدید امنیت حساب | Controller جدید `TechnicianSecurityController` |
| 6 | ثبت مسیرها | `routes/api.php` |

نکتهٔ مهم: هر «نشست» در این طراحی همان یک ردیف `personal_access_tokens` (توکن Sanctum) است و هر «دستگاه» = توکن‌های با `device_id` یکسان. جدول جدیدی لازم نیست.

---

## ۱. Migration

فایل جدید: `database/migrations/2026_10_03_000001_add_device_columns_to_personal_access_tokens_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->string('device_id', 100)->nullable()->after('abilities');
            $table->string('platform', 20)->nullable()->after('device_id');       // android | ios | web
            $table->string('device_type', 20)->nullable()->after('platform');     // phone | tablet | desktop | web | tv | unknown
            $table->string('device_brand', 100)->nullable()->after('device_type');
            $table->string('device_model', 100)->nullable()->after('device_brand');
            $table->string('os_name', 50)->nullable()->after('device_model');
            $table->string('os_version', 50)->nullable()->after('os_name');
            $table->string('app_version', 50)->nullable()->after('os_version');
            $table->string('ip_address', 45)->nullable()->after('app_version');   // IP هنگام ورود
            $table->string('last_ip', 45)->nullable()->after('ip_address');       // IP آخرین اتصال
            $table->text('user_agent')->nullable()->after('last_ip');

            $table->index(['tokenable_type', 'tokenable_id', 'device_id'], 'pat_tokenable_device_index');
        });
    }

    public function down(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->dropIndex('pat_tokenable_device_index');
            $table->dropColumn([
                'device_id', 'platform', 'device_type', 'device_brand', 'device_model',
                'os_name', 'os_version', 'app_version', 'ip_address', 'last_ip', 'user_agent',
            ]);
        });
    }
};
```

همهٔ ستون‌ها nullable هستند. این جدول بین کاربر، سازمان و تکنسین مشترک است و این تغییر روی بقیه اثری ندارد. توکن‌های فعلی هم با مقادیر null می‌مانند و اپ با فراخوانی `PUT current-device` (بند ۵-۶) آن‌ها را پر می‌کند.

---

## ۲. `app/Http/Requests/TechnicianLoginRequest.php`

به `rules()` اضافه شود. همه اختیاری‌اند، چون نسخه‌های قدیمی اپ آن‌ها را نمی‌فرستند:

```php
'device_id'    => 'nullable|string|max:100',
'platform'     => 'nullable|string|in:android,ios,web',
'device_type'  => 'nullable|string|in:phone,tablet,desktop,web,tv,unknown',
'device_brand' => 'nullable|string|max:100',
'device_model' => 'nullable|string|max:100',
'os_name'      => 'nullable|string|max:50',
'os_version'   => 'nullable|string|max:50',
'app_version'  => 'nullable|string|max:50',
```

بدنهٔ درخواستی که اپ از این به بعد به `POST /api/technician/login` می‌فرستد:

```json
{
  "referral_code": "123456",
  "password": "********",
  "device_id": "android-m1k2x9-ab12cd34ef56gh78",
  "platform": "android",
  "device_type": "phone",
  "device_brand": "samsung",
  "device_model": "SM-A225F",
  "os_name": "Android",
  "os_version": "13",
  "app_version": "1.0.0"
}
```

`device_id` همان شناسهٔ ثابت هر نصب است که اپ هنگام ثبت توکن FCM هم در `firebase_device_tokens.device_id` می‌فرستد.

---

## ۳. ثبت دستگاه روی توکن هنگام ورود

### `app/Http/Controllers/TechnicianRegistrationController.php` — متد `login` (حدود خط ۱۳۸)

```php
// قبل:
$result = $service->login($request->referral_code, $request->password);

// بعد:
$result = $service->login(
    $request->referral_code,
    $request->password,
    $request->only([
        'device_id', 'platform', 'device_type', 'device_brand',
        'device_model', 'os_name', 'os_version', 'app_version',
    ]) + [
        'ip_address' => $request->ip(),
        'last_ip'    => $request->ip(),
        'user_agent' => $request->userAgent(),
    ]
);
```

### `app/Services/TechnicianRegistrationService.php` — متد `login` (حدود خط ۲۹۰ و ۳۳۸)

امضای متد:

```php
public function login(string $referralCode, string $password, array $device = []): array
```

به‌جای خط ساخت توکن (حدود خط ۳۳۸):

```php
// قبل:
$token = $technician->createToken('technician-app')->plainTextToken;

// بعد:
$newToken = $technician->createToken('technician-app');
$accessToken = $newToken->accessToken;

$accessToken->forceFill(array_filter($device, fn ($v) => $v !== null && $v !== ''))->save();

// ورود دوباره روی همان دستگاه، نشست قبلی همان دستگاه را جایگزین می‌کند
// تا در «دستگاه‌های واردشده» یک دستگاه چند بار دیده نشود.
if (!empty($device['device_id'])) {
    $technician->tokens()
        ->where('device_id', $device['device_id'])
        ->where('id', '!=', $accessToken->id)
        ->delete();
}

$token = $newToken->plainTextToken;
```

> `forceFill` لازم است، چون ستون‌های جدید در `$fillable` مدل `PersonalAccessToken` نیستند.

---

## ۴. Middleware «IP آخرین اتصال»

«آخرین فعالیت» را خود Sanctum در `last_used_at` ثبت می‌کند. فقط IP باید جدا ثبت شود.

فایل جدید: `app/Http/Middleware/TrackTokenActivity.php`

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class TrackTokenActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->user()?->currentAccessToken();

        // فقط وقتی IP عوض شده می‌نویسد، تا هر درخواست یک UPDATE اضافه نداشته باشد.
        if ($token instanceof PersonalAccessToken && $token->last_ip !== $request->ip()) {
            $token->forceFill(['last_ip' => $request->ip()])->saveQuietly();
        }

        return $next($request);
    }
}
```

ثبت alias در `bootstrap/app.php`، داخل `$middleware->alias([...])`:

```php
'track.token' => \App\Http\Middleware\TrackTokenActivity::class,
```

> اگر سرور پشت پروکسی یا CDN است، `$middleware->trustProxies(at: '*')` (یا IP پروکسی) هم باید تنظیم شود. وگرنه `$request->ip()` به‌جای IP واقعی گوشی، IP پروکسی را برمی‌گرداند.

---

## ۵. Controller جدید: `app/Http/Controllers/TechnicianSecurityController.php`

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Laravel\Sanctum\PersonalAccessToken;

class TechnicianSecurityController extends Controller
{
    private const DEVICE_FIELDS = [
        'device_id', 'platform', 'device_type', 'device_brand',
        'device_model', 'os_name', 'os_version', 'app_version',
    ];

    /** GET /api/technician/security/devices */
    public function devices(Request $request): JsonResponse
    {
        $currentId = $request->user()->currentAccessToken()->id;

        $devices = $this->activeTokens($request)
            ->groupBy(fn (PersonalAccessToken $t) => $this->deviceKey($t))
            ->map(function (Collection $tokens, string $key) use ($currentId) {
                // جدیدترین نشست هر دستگاه، اطلاعات دستگاه را می‌دهد
                $latest = $tokens->sortByDesc(fn ($t) => $t->last_used_at ?? $t->created_at)->first();

                return [
                    'id'             => $key,
                    'device_id'      => $latest->device_id,
                    'platform'       => $latest->platform,
                    'device_type'    => $latest->device_type,
                    'device_brand'   => $latest->device_brand,
                    'device_model'   => $latest->device_model,
                    'os_name'        => $latest->os_name,
                    'os_version'     => $latest->os_version,
                    'app_version'    => $latest->app_version,
                    'last_ip'        => $latest->last_ip ?? $latest->ip_address,
                    'location'       => null, // اختیاری؛ بند ۸
                    'last_active_at' => ($latest->last_used_at ?? $latest->created_at)?->toISOString(),
                    'is_current'     => $tokens->contains('id', $currentId),
                    'sessions_count' => $tokens->count(),
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => ['devices' => $devices, 'total' => $devices->count()],
        ]);
    }

    /** DELETE /api/technician/security/devices/{deviceKey} */
    public function logoutDevice(Request $request, string $deviceKey): JsonResponse
    {
        $tokens = $this->activeTokens($request)
            ->filter(fn ($t) => $this->deviceKey($t) === $deviceKey);

        if ($tokens->isEmpty()) {
            return $this->error('دستگاه پیدا نشد.', 'DEVICE_NOT_FOUND', 404);
        }
        if ($tokens->contains('id', $request->user()->currentAccessToken()->id)) {
            return $this->error('برای خروج از دستگاه فعلی از «خروج از حساب» استفاده کنید.', 'CURRENT_DEVICE', 422);
        }

        $this->revoke($request, $tokens);

        return response()->json(['success' => true, 'message' => 'حساب از این دستگاه خارج شد.']);
    }

    /** POST /api/technician/security/logout-others */
    public function logoutOthers(Request $request): JsonResponse
    {
        $currentId = $request->user()->currentAccessToken()->id;
        $others = $this->activeTokens($request)->where('id', '!=', $currentId);

        $devicesCount = $others->map(fn ($t) => $this->deviceKey($t))->unique()->count();
        $this->revoke($request, $others);

        return response()->json([
            'success' => true,
            'message' => 'حساب شما از سایر دستگاه‌ها خارج شد.',
            'data' => ['revoked_sessions' => $others->count(), 'revoked_devices' => $devicesCount],
        ]);
    }

    /** GET /api/technician/security/sessions */
    public function sessions(Request $request): JsonResponse
    {
        $currentId = $request->user()->currentAccessToken()->id;

        $sessions = $this->activeTokens($request)
            ->sortByDesc(fn ($t) => $t->last_used_at ?? $t->created_at)
            ->map(fn (PersonalAccessToken $t) => [
                'id'           => $t->id,
                'device_id'    => $t->device_id,
                'platform'     => $t->platform,
                'device_type'  => $t->device_type,
                'device_brand' => $t->device_brand,
                'device_model' => $t->device_model,
                'os_name'      => $t->os_name,
                'os_version'   => $t->os_version,
                'app_version'  => $t->app_version,
                'ip_address'   => $t->ip_address,
                'last_ip'      => $t->last_ip,
                'created_at'   => $t->created_at?->toISOString(),
                'last_used_at' => $t->last_used_at?->toISOString(),
                'expires_at'   => $t->expires_at?->toISOString(),
                'status'       => $t->expires_at?->isPast() ? 'expired' : 'active',
                'is_current'   => $t->id === $currentId,
            ])
            ->values();

        return response()->json(['success' => true, 'data' => ['sessions' => $sessions]]);
    }

    /** DELETE /api/technician/security/sessions/{id} */
    public function endSession(Request $request, int $id): JsonResponse
    {
        $token = $request->user()->tokens()->whereKey($id)->first();

        if (!$token) {
            return $this->error('نشست پیدا نشد.', 'SESSION_NOT_FOUND', 404);
        }
        if ($token->id === $request->user()->currentAccessToken()->id) {
            return $this->error('برای پایان نشست فعلی از «خروج از حساب» استفاده کنید.', 'CURRENT_SESSION', 422);
        }

        $this->revoke($request, collect([$token]));

        return response()->json(['success' => true, 'message' => 'نشست پایان یافت.']);
    }

    /** PUT /api/technician/security/current-device */
    public function updateCurrentDevice(Request $request): JsonResponse
    {
        $data = $request->validate([
            'device_id'    => 'nullable|string|max:100',
            'platform'     => 'nullable|string|in:android,ios,web',
            'device_type'  => 'nullable|string|in:phone,tablet,desktop,web,tv,unknown',
            'device_brand' => 'nullable|string|max:100',
            'device_model' => 'nullable|string|max:100',
            'os_name'      => 'nullable|string|max:50',
            'os_version'   => 'nullable|string|max:50',
            'app_version'  => 'nullable|string|max:50',
        ]);

        $token = $request->user()->currentAccessToken();
        $token->forceFill(array_filter($data, fn ($v) => $v !== null && $v !== '') + [
            'ip_address' => $token->ip_address ?? $request->ip(),
            'last_ip'    => $request->ip(),
            'user_agent' => $token->user_agent ?? $request->userAgent(),
        ])->save();

        return response()->json(['success' => true]);
    }

    // -----------------------------------------------------------------

    /** نشست‌های این تکنسین؛ توکن‌های منقضی‌شده نمایش داده نمی‌شوند */
    private function activeTokens(Request $request): Collection
    {
        return $request->user()->tokens()
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->get();
    }

    /** نشست‌های قدیمی بدون device_id هر کدام یک «دستگاه» جدا حساب می‌شوند */
    private function deviceKey(PersonalAccessToken $token): string
    {
        return $token->device_id ?: 'session-' . $token->id;
    }

    /** حذف نشست‌ها + توکن FCM همان دستگاه‌ها، تا دستگاه خارج‌شده اعلان نگیرد */
    private function revoke(Request $request, Collection $tokens): void
    {
        $technician = $request->user();
        // اگر نشست قدیمیِ تکراری با device_id دستگاه فعلی حذف شود،
        // توکن FCM دستگاه فعلی نباید پاک شود.
        $currentDeviceId = $technician->currentAccessToken()->device_id;
        $deviceIds = $tokens->pluck('device_id')->filter()->unique()
            ->reject(fn ($id) => $id === $currentDeviceId);

        PersonalAccessToken::whereIn('id', $tokens->pluck('id'))->delete();

        if ($deviceIds->isNotEmpty()) {
            $technician->firebaseDeviceTokens()->whereIn('device_id', $deviceIds)->delete();
        }
    }

    private function error(string $message, string $code, int $status): JsonResponse
    {
        return response()->json(['success' => false, 'message' => $message, 'error_code' => $code], $status);
    }
}
```

> اگر بعداً برای توکن‌ها انقضا تعریف شود (`expiration` در `config/sanctum.php` الان `null` است)، اپ «زمان انقضا» را نمایش می‌دهد. در غیر این صورت «بدون انقضا» می‌نویسد. اضافه کردن انقضا جزو این درخواست نیست، چون باعث می‌شود تکنسین‌ها به‌طور دوره‌ای از حساب خارج شوند.

---

## ۶. مسیرها: `routes/api.php`

داخل گروه «Technician protected routes» (حدود خط ۲۹۲، بعد از `logout-all`):

```php
// Account security — devices & sessions
Route::prefix('security')->middleware('track.token')->group(function () {
    Route::get('/devices', [TechnicianSecurityController::class, 'devices'])->name('api.technician.security.devices');
    Route::delete('/devices/{deviceKey}', [TechnicianSecurityController::class, 'logoutDevice'])->name('api.technician.security.devices.destroy');
    Route::post('/logout-others', [TechnicianSecurityController::class, 'logoutOthers'])->name('api.technician.security.logout-others');
    Route::get('/sessions', [TechnicianSecurityController::class, 'sessions'])->name('api.technician.security.sessions');
    Route::delete('/sessions/{id}', [TechnicianSecurityController::class, 'endSession'])->whereNumber('id')->name('api.technician.security.sessions.destroy');
    Route::put('/current-device', [TechnicianSecurityController::class, 'updateCurrentDevice'])->name('api.technician.security.current-device');
});
```

و `use App\Http\Controllers\TechnicianSecurityController;` بالای فایل اضافه شود.

برای اینکه «IP آخرین اتصال» واقعاً با آخرین درخواست به‌روز شود، `->middleware('track.token')` را به **کل** گروه `Route::prefix('technician')` محافظت‌شده بدهید، نه فقط زیرگروه `security`:

```php
Route::prefix('technician')->middleware('track.token')->group(function () {
```

> **نکته:** `/devices/{deviceKey}` مقدار `device_id` را URL-encode شده می‌گیرد، مثل `android-m1k2x9-ab12cd34` یا `session-15`. Laravel آن را decode می‌کند. محدودیتی روی کاراکترها نگذارید.

---

## ۷. قرارداد پاسخ‌ها (همان چیزی که اپ می‌خواند)

همهٔ پاسخ‌ها `{ "success": bool, "message"?: string, "data"?: ... , "error_code"?: string }` هستند. تاریخ‌ها ISO-8601 با timezone (خروجی `toISOString()`) برگردانده می‌شوند. اپ آن‌ها را به شمسی و ساعت تهران تبدیل می‌کند.

| Endpoint | پاسخ موفق |
|---|---|
| `GET devices` | `data.devices[]` با فیلدهای `id, device_id, platform, device_type, device_brand, device_model, os_name, os_version, app_version, last_ip, location, last_active_at, is_current, sessions_count` |
| `DELETE devices/{id}` | `{ success: true, message }` · خطاها: `404 DEVICE_NOT_FOUND`، `422 CURRENT_DEVICE` |
| `POST logout-others` | `data.revoked_sessions`، `data.revoked_devices` |
| `GET sessions` | `data.sessions[]` با فیلدهای `id, device_*, os_*, app_version, ip_address, last_ip, created_at, last_used_at, expires_at, status (active/expired), is_current` |
| `DELETE sessions/{id}` | `{ success: true, message }` · خطاها: `404 SESSION_NOT_FOUND`، `422 CURRENT_SESSION` |
| `PUT current-device` | `{ success: true }` |

نمونهٔ `GET devices`:

```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "id": "android-m1k2x9-ab12cd34ef56gh78",
        "device_id": "android-m1k2x9-ab12cd34ef56gh78",
        "platform": "android",
        "device_type": "phone",
        "device_brand": "samsung",
        "device_model": "SM-A225F",
        "os_name": "Android",
        "os_version": "13",
        "app_version": "1.0.0",
        "last_ip": "5.120.33.10",
        "location": null,
        "last_active_at": "2026-10-03T15:12:00.000000Z",
        "is_current": true,
        "sessions_count": 1
      }
    ],
    "total": 1
  }
}
```

اپ خروج از **دستگاه یا نشست فعلی** را از این API‌ها انجام نمی‌دهد. برای آن همان `POST /technician/logout` فعلی را صدا می‌زند. پس پاسخ‌های `422 CURRENT_*` فقط محافظ هستند.

---

## ۸. موقعیت تقریبی (اختیاری)

سند گفته «در صورت استفاده از آن». اپ موقعیت GPS را برای این بخش جمع نمی‌کند. اگر بک‌اند بخواهد، می‌تواند از روی `last_ip` با یک سرویس GeoIP یک رشتهٔ ساده مثل `"تهران، ایران"` در فیلد `location` برگرداند. اپ فقط وقتی مقدار دارد آن را نشان می‌دهد.

---

## ۹. چک‌لیست تست

- [ ] `php artisan migrate`، و ورود با اپ جدید: ستون‌های دستگاه روی توکن جدید پر می‌شوند.
- [ ] ورود دوباره روی همان گوشی: فقط **یک** توکن برای آن `device_id` می‌ماند.
- [ ] ورود با دو گوشی: `GET devices` دو دستگاه برمی‌گرداند و `is_current` روی هرکدام درست است.
- [ ] `DELETE devices/{id}` گوشی دوم: درخواست بعدی گوشی دوم `401` می‌گیرد و اپ به صفحهٔ ورود می‌رود. ردیف FCM آن گوشی هم حذف شده است.
- [ ] `POST logout-others`: فقط توکن فعلی باقی می‌ماند.
- [ ] `DELETE devices/{id}` و `DELETE sessions/{id}` روی نشست فعلی: `422`.
- [ ] `DELETE sessions/{id}` با شناسهٔ توکنِ تکنسین دیگر: `404`، نه حذف.
- [ ] توکن‌های قدیمی (قبل از migration): بعد از باز کردن اپ جدید، `PUT current-device` اطلاعاتشان را پر می‌کند.
- [ ] نسخهٔ قدیمی اپ (بدون فیلدهای دستگاه) هنوز بدون خطا وارد می‌شود.
