import axios from 'axios';
import { uri as BASE_URL } from './URL';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Error getting token from AsyncStorage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      AsyncStorage.removeItem('userToken');
      AsyncStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

/**
 * Handle API responses and format them consistently
 */
const handleResponse = (response) => {
  return {
    success: true,
    data: response.data.data || response.data,
    message: response.data.message || 'عملیات با موفقیت انجام شد',
  };
};

/**
 * Handle API errors and format them consistently
 */
const handleError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    return {
      success: false,
      message: data.message || 'خطا در ارتباط با سرور',
      error_code: data.error_code || `HTTP_${status}`,
      errors: data.errors || null,
      status,
    };
  } else if (error.request) {
    // Network error
    return {
      success: false,
      message: 'خطا در ارتباط با اینترنت',
      error_code: 'NETWORK_ERROR',
    };
  } else {
    // Unknown error
    return {
      success: false,
      message: 'خطای غیرمنتظره',
      error_code: 'UNKNOWN_ERROR',
    };
  }
};

// =============================================================================
// DEBUG & TEST FUNCTIONS
// =============================================================================

/**
 * Test API connectivity using expertises endpoint
 */
export const testApiConnection = async () => {
  try {
    console.log('🧪 Testing API connection to:', BASE_URL);
    
    // Use expertises endpoint for testing since it's guaranteed to exist
    const response = await api.get('/expertises', { timeout: 5000 });
    console.log('✅ API connection test successful');
    return { 
      success: true, 
      message: 'API connection working',
      data: response.data
    };
  } catch (error) {
    console.error('❌ API connection test failed:', error.message);
    
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      return { 
        success: false, 
        message: 'خطا در اتصال به شبکه - لطفاً اتصال اینترنت خود را بررسی کنید' 
      };
    }
    
    return { 
      success: false, 
      message: `خطا در اتصال به سرور: ${error.message}` 
    };
  }
};

/**
 * Test expertises endpoint specifically
 */
export const testExpertisesEndpoint = async () => {
  const fullUrl = `${BASE_URL}/expertises`;
  console.log('🔍 Testing expertises endpoint:', fullUrl);
  
  try {
    // Test with fetch first to see raw response
    const fetchResponse = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    
    console.log('📡 Fetch response status:', fetchResponse.status);
    console.log('📡 Fetch response headers:', fetchResponse.headers);
    
    if (!fetchResponse.ok) {
      const errorText = await fetchResponse.text();
      console.error('❌ Fetch error response body:', errorText);
      return {
        success: false,
        message: `HTTP ${fetchResponse.status}: ${errorText}`
      };
    }
    
    const data = await fetchResponse.json();
    console.log('✅ Fetch response data:', data);
    
    return {
      success: true,
      data,
      message: 'Expertises endpoint working'
    };
    
  } catch (error) {
    console.error('❌ Test expertises endpoint failed:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// =============================================================================
// TECHNICIAN REGISTRATION & LOGIN APIs
// =============================================================================

/**
 * Get list of available expertises
 */
export const getExpertises = async () => {
  try {
    console.log('🚀 Making request to:', `${BASE_URL}/expertises`);
    const response = await api.get('/expertises');
    console.log('✅ Response received:', response.status, response.data);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ API Error for expertises:', error.message);
    console.error('❌ Request URL was:', `${BASE_URL}/expertises`);
    if (error.response) {
      console.error('❌ Error response:', error.response.status, error.response.data);
    }
    return handleError(error);
  }
};

/**
 * Register a new technician with multipart form data
 */
export const registerTechnician = async (formData, resumeFile = null) => {
  try {
    console.log('🚀 Registering technician...');
    
    // Create multipart form data
    const multipartData = new FormData();
    
    // Add all form fields
    for (const [key, value] of formData.entries()) {
      if (key === 'expertise_ids' && Array.isArray(value)) {
        // Handle expertise_ids array
        value.forEach(id => {
          multipartData.append('expertise_ids[]', id);
        });
      } else {
        multipartData.append(key, value);
      }
    }
    
    // Add resume file if provided
    if (resumeFile) {
      console.log('📎 اضافه کردن فایل رزومه:', {
        uri: resumeFile.uri,
        name: resumeFile.name,
        type: resumeFile.mimeType || resumeFile.type
      });
      
      // React Native FormData format for file upload
      multipartData.append('resume', {
        uri: resumeFile.uri,
        name: resumeFile.name || 'resume.pdf',
        type: resumeFile.mimeType || resumeFile.type || 'application/pdf',
      });
      
      console.log('✅ فایل رزومه به FormData اضافه شد');
    } else {
      console.log('⚠️ هیچ فایل رزومه‌ای انتخاب نشده');
    }
    
    // Log FormData contents for debugging
    console.log('📋 محتویات FormData:');
    for (const [key, value] of formData.entries()) {
      if (key !== 'password') {
        console.log(`  ${key}:`, typeof value === 'object' ? 'file' : value);
      }
    }
    
    const response = await api.post('/technician/register', multipartData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for file upload
    });
    
    console.log('✅ Registration successful:', response.data);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ Registration failed:', error);
    return handleError(error);
  }
};

/**
 * Verify technician's phone number with SMS code
 */
export const verifyPhoneNumber = async (phone, code) => {
  try {
    const response = await api.post('/technician/verify-phone', {
      phone,
      code,
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Resend verification code to technician
 */
export const resendVerificationCode = async (phone) => {
  try {
    const response = await api.post('/technician/resend-code', {
      phone,
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Validate referral code
 */
export const validateReferralCode = async (referralCode) => {
  try {
    const response = await api.post('/technician/validate-referral', {
      referral_code: referralCode,
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Login technician
 */
export const loginTechnician = async (referralCodeOrPhone, password) => {
  try {
    console.log('📡 API loginTechnician فراخوانی شد');
    console.log('ورودی اول:', referralCodeOrPhone);
    console.log('رمز عبور:', password ? '***' : 'خالی');
    
    // Determine if input is phone or referral code
    const isPhone = /^09\d{9}$/.test(referralCodeOrPhone);
    console.log('نوع ورودی:', isPhone ? 'شماره تلفن' : 'کد معرف');
    
    const requestBody = {
      ...(isPhone ? { phone: referralCodeOrPhone } : { referral_code: referralCodeOrPhone }),
      password,
    };
    console.log('Body ارسالی:', JSON.stringify(requestBody, null, 2));
    console.log('URL کامل:', `${BASE_URL}/technician/login`);
    
    const response = await api.post('/technician/login', requestBody);
    console.log('✅ پاسخ سرور دریافت شد:', response.status);
    console.log('داده پاسخ:', JSON.stringify(response.data, null, 2));
    
    const result = handleResponse(response);
    console.log('نتیجه پردازش شده:', JSON.stringify(result, null, 2));
    
    // Store token and user data if login successful
    if (result.success && result.data.token) {
      console.log('ذخیره توکن و اطلاعات کاربر...');
      await AsyncStorage.setItem('userToken', result.data.token);
      // Store the complete data structure (not just technician)
      await AsyncStorage.setItem('userData', JSON.stringify(result.data));
      console.log('✅ توکن و userData کامل ذخیره شد');
    }
    
    return result;
  } catch (error) {
    console.error('❌ خطا در loginTechnician API:');
    console.error('نوع خطا:', error.name);
    console.error('پیام:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Response headers:', error.response.headers);
    }
    if (error.request) {
      console.error('Request:', error.request);
    }
    return handleError(error);
  }
};

/**
 * Logout technician
 */
export const logoutTechnician = async () => {
  try {
    console.log('🚪 شروع فرآیند خروج...');
    const response = await api.post('/technician/logout');
    console.log('✅ پاسخ سرور logout:', response.status, response.data);
    
    // Clear authentication data (but KEEP userData for next login!)
    console.log('🗑️ پاک کردن توکن احراز هویت...');
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('savedReferralCode');
    await AsyncStorage.removeItem('savedPassword');
    console.log('✅ توکن پاک شد (userData حفظ شد برای بار بعد)');
    // ⚠️ Note: We DON'T remove 'userData' so it can be used after next login
    
    return handleResponse(response);
  } catch (error) {
    console.error('❌ خطا در logout API:', error);
    // Clear authentication data even if logout API fails
    console.log('🗑️ پاک کردن توکن احراز هویت (در صورت خطا)...');
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('savedReferralCode');
    await AsyncStorage.removeItem('savedPassword');
    console.log('✅ توکن پاک شد (userData حفظ شد برای بار بعد)');
    return handleError(error);
  }
};

/**
 * Validate technician token
 */
export const validateToken = async () => {
  try {
    console.log('🔐 اعتبارسنجی توکن...');
    const response = await api.post('/technician/validate-token');
    console.log('✅ توکن معتبر است');
    return handleResponse(response);
  } catch (error) {
    console.error('❌ توکن نامعتبر یا منقضی شده');
    return handleError(error);
  }
};

/**
 * Request password reset - Send OTP
 * @param {Object} data - { referral_code, phone, melicode, email }
 */
export const requestPasswordReset = async (data) => {
  try {
    console.log('📧 درخواست ارسال کد بازیابی رمز...');
    console.log('اطلاعات ارسالی:', data);
    
    const response = await api.post('/technician/forgot-password', data);
    console.log('✅ کد بازیابی ارسال شد:', response.data);
    
    return handleResponse(response);
  } catch (error) {
    console.error('❌ خطا در ارسال کد بازیابی:', error.response?.data || error.message);
    return handleError(error);
  }
};

/**
 * Verify reset code (Step 2)
 * @param {Object} data - { phone, code }
 */
export const verifyResetCode = async (data) => {
  try {
    console.log('� تأیید کد بازیابی...');
    console.log('شماره:', data.phone, 'کد:', data.code);
    
    const response = await api.post('/technician/verify-reset-code', data);
    console.log('✅ کد تأیید شد:', response.data);
    
    return handleResponse(response);
  } catch (error) {
    console.error('❌ خطا در تأیید کد:', error.response?.data || error.message);
    return handleError(error);
  }
};

/**
 * Reset password with new password (Step 3)
 * @param {Object} data - { phone, new_password, new_password_confirmation }
 */
export const resetPassword = async (data) => {
  try {
    console.log('🔑 تنظیم رمز عبور جدید...');
    console.log('📤 داده‌های ارسالی به API:', JSON.stringify({
      phone: data.phone,
      new_password: '***',
      new_password_confirmation: '***',
    }));
    
    const response = await api.post('/technician/reset-password', data);
    console.log('✅ رمز عبور تغییر یافت:', response.data);
    
    return handleResponse(response);
  } catch (error) {
    console.error('❌ خطا در تغییر رمز عبور:', error.response?.data || error.message);
    console.error('📥 پاسخ کامل خطا:', JSON.stringify(error.response?.data, null, 2));
    return handleError(error);
  }
};

/**
 * Get technician profile
 */
export const getTechnicianProfile = async () => {
  try {
    console.log('🔍 درخواست دریافت پروفایل متخصص...');
    console.log('📍 Endpoint: GET /technician/profile');
    const response = await api.get('/technician/profile');
    console.log('✅ پاسخ دریافت شد:', response.status);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ خطا در دریافت پروفایل:', error.message);
    console.error('📍 Endpoint: GET /technician/profile');
    if (error.response) {
      console.error('📥 Status:', error.response.status);
      console.error('📥 Data:', error.response.data);
    }
    return handleError(error);
  }
};

/**
 * Update technician profile
 */
export const updateTechnicianProfile = async (formData) => {
  try {
    const response = await api.put('/technician/profile', formData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Update technician personal info (with photo upload support)
 * @param {Object} data - Personal info data
 * @param {Object} profilePhoto - Profile photo file (optional)
 */
export const updatePersonalInfo = async (data, profilePhoto = null) => {
  try {
    console.log('📝 به‌روزرسانی اطلاعات شخصی...');
    
    // If there's a photo, use multipart/form-data
    if (profilePhoto) {
      const formData = new FormData();
      
      // Add profile photo
      const photoData = {
        uri: profilePhoto.uri,
        name: profilePhoto.name || 'profile.jpg',
        type: profilePhoto.type || 'image/jpeg',
      };
      
      console.log('📸 اطلاعات عکس برای ارسال:', photoData);
      
      // Try different field names that backend might expect
      formData.append('profile_photo', photoData);
      // Also try with _method for Laravel
      formData.append('_method', 'PUT');
      
      // Add other fields (exclude fields that Backend doesn't allow to change)
      const excludedFields = ['other_referral_code', 'referral_code']; // Backend doesn't allow changing these
      Object.keys(data).forEach(key => {
        if (!excludedFields.includes(key) && data[key] !== null && data[key] !== undefined && data[key] !== '') {
          formData.append(key, data[key]);
        }
      });
      
      console.log('📤 ارسال با عکس پروفایل به Backend (POST with _method=PUT)');
      console.log('🔗 URL: /technician/profile/personal-info');
      
      // Use POST with _method=PUT for Laravel compatibility with file uploads
      const response = await api.post('/technician/profile/personal-info', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });
      
      console.log('✅ اطلاعات شخصی با عکس به‌روز شد');
      console.log('📦 Response کامل:', JSON.stringify(response.data, null, 2));
      console.log('🖼️ profile_photo_path در response:', response.data?.data?.technician?.profile_photo_path);
      return handleResponse(response);
    } else {
      // Without photo, use JSON
      console.log('📤 ارسال بدون عکس پروفایل');
      
      // Remove fields that Backend doesn't allow to change
      const { other_referral_code, referral_code, ...editableData } = data;
      
      const response = await api.put('/technician/profile/personal-info', editableData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('✅ اطلاعات شخصی به‌روز شد:', response.data);
      return handleResponse(response);
    }
  } catch (error) {
    console.error('❌ خطا در به‌روزرسانی اطلاعات شخصی:', error.response?.data || error.message);
    return handleError(error);
  }
};

/**
 * Update vehicle info (car/motorcycle details)
 * @param {Object} data - Vehicle info data
 */
export const updateVehicleInfo = async (data) => {
  try {
    console.log('🚗 به‌روزرسانی اطلاعات خودرو...');
    
    const response = await api.put('/technician/profile/vehicle-info', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('✅ اطلاعات خودرو به‌روز شد:', response.data);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ خطا در به‌روزرسانی اطلاعات خودرو:', error.response?.data || error.message);
    return handleError(error);
  }
};

/**
 * Update bank info (IBAN, card number, bank name)
 * @param {Object} data - Bank info data
 */
export const updateBankInfo = async (data) => {
  try {
    console.log('💳 به‌روزرسانی اطلاعات بانکی...');
    
    const response = await api.put('/technician/profile/bank-info', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('✅ اطلاعات بانکی به‌روز شد:', response.data);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ خطا در به‌روزرسانی اطلاعات بانکی:', error.response?.data || error.message);
    return handleError(error);
  }
};

/**
 * Change technician password
 * @param {Object} data - Password data (current_password, new_password, new_password_confirmation)
 */
export const changePassword = async (data) => {
  try {
    console.log('🔒 تغییر رمز عبور...');
    
    const response = await api.patch('/technician/profile/password', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('✅ رمز عبور تغییر یافت:', response.data);
    return handleResponse(response);
  } catch (error) {
    console.error('❌ خطا در تغییر رمز عبور:', error.response?.data || error.message);
    return handleError(error);
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return !!token;
  } catch (error) {
    return false;
  }
};

/**
 * Get stored user data
 */
export const getStoredUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Clear all stored authentication data
 */
export const clearAuthData = async () => {
  try {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    return true;
  } catch (error) {
    console.error('Error clearing auth data:', error);
    return false;
  }
};

// Export the configured axios instance for custom requests
export default api;