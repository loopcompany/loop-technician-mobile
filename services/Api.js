import axios from 'axios';
import { Platform } from 'react-native';
import { uri as BASE_URL, Technician_Orders, Technician_DeliveryReports } from './URL';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from './ApiEndpoints';
import i18n from 'i18next';
const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
// Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Language': lang
  },
});

// Request interceptor to add auth token and log requests
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
    console.log('❌ Request Setup Error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log('✅ API Response:', {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      statusText: response.statusText
    });
    return response;
  },
  (error) => {
    // Detailed error logging
    if (error.response) {
      // Server responded with error status
      console.log('❌ API Error Response:', {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        fullURL: `${error.config?.baseURL}${error.config?.url}`,
        status: error.response.status,
        statusText: error.response.statusText,
        message: error.response.data?.message || 'No message',
        data: error.response.data
      });

      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.warn('🔒 Token expired or invalid - clearing auth data');
        AsyncStorage.removeItem('userToken');
        AsyncStorage.removeItem('userData');
      }
    } else if (error.request) {
      // Request made but no response received
      console.log('❌ No Response from Server:', {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        fullURL: `${error.config?.baseURL}${error.config?.url}`,
        message: 'سرور پاسخی نداد'
      });
    } else {
      // Something else happened
      console.log('❌ Request Error:', error.message);
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
 * Get extra services registered for an order (user view)
 * GET /orders/{orderId}/extra-services
 */
export const getOrderExtras = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}/extra-services`);
    console.log('📥 getOrderExtras - Raw Response:', JSON.stringify(response.data, null, 2));
    const result = handleResponse(response);
    console.log('📥 getOrderExtras - After handleResponse:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.log('❌ getOrderExtras - Error:', error?.response?.data || error.message);
    return handleError(error);
  }
};
export const educationRegistrationAPI = {
  // Create new education registration
  create: async (data) => {
    try {
      const response = await api.post('/technician/education-registerations', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all education registrations for the user
  getAll: async () => {
    try {
      const response = await api.get('/technician/education-registerations');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get details of a specific education registration
  getById: async (id) => {
    try {
      const response = await api.get(`/technician/education-registerations/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
/**
 * اعلام شروع تعمیر
 * POST /technician/orders/{orderId}/start
 */
export const startRepair = async (orderId) => {
  try {
    console.log(`🔧 اعلام شروع تعمیر برای سفارش #${orderId}...`);

    const response = await api.post(`/technician/orders/${orderId}/start`);
    console.log('✅ شروع کار با موفقیت ثبت شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در ثبت شروع تعمیر:', error.response?.data || error.message);
    if (error.response) {
      console.log('❌ Status:', error.response.status);
      console.log('❌ Data:', error.response.data);
    }
    return handleError(error);
  }
};

/**
 * ثبت گزارش تحویل جدید
 */
export const createDeliveryReport = async (reportData) => {
  try {
    console.log('📝 ثبت گزارش تحویل:', reportData);
    const response = await api.post(
      `${Technician_DeliveryReports}`,
      reportData
    );
    console.log('✅ گزارش تحویل ثبت شد:', response.data);
    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در ثبت گزارش تحویل:', error.response?.data || error.message);
    if (error.response) {
      console.log('❌ Status:', error.response.status);
      console.log('❌ Data:', error.response.data);
    }
    return handleError(error);
  }
};

/**
 * ویرایش گزارش تحویل
 */
export const updateDeliveryReport = async (reportId, reportData) => {
  try {
    console.log(`📝 ویرایش گزارش تحویل ${reportId}:`, reportData);
    const response = await api.put(
      `${Technician_DeliveryReports}/${reportId}`,
      reportData
    );
    console.log('✅ گزارش تحویل ویرایش شد:', response.data);
    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در ویرایش گزارش تحویل:', error.response?.data || error.message);
    if (error.response) {
      console.log('❌ Status:', error.response.status);
      console.log('❌ Data:', error.response.data);
    }
    return handleError(error);
  }
};

/**
 * دریافت گزارش تحویل بر اساس سفارش
 */
export const getDeliveryReportByOrderId = async (orderId) => {
  try {
    console.log(`📋 دریافت گزارش تحویل برای سفارش ${orderId}`);
    const response = await api.get(
      `${Technician_DeliveryReports}/order/${orderId}`
    );
    console.log('✅ گزارش تحویل دریافت شد:', response.data);
    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت گزارش تحویل:', error.response?.data || error.message);
    if (error.response) {
      console.log('❌ Status:', error.response.status);
      console.log('❌ Data:', error.response.data);
    }
    return handleError(error);
  }
};

/**
 * تایید گزارش تحویل با کد 6 رقمی
 */
export const verifyDeliveryReportWithCode = async (orderId, code) => {
  try {
    console.log(`🔐 تایید گزارش تحویل با کد برای سفارش ${orderId}`);
    const response = await api.post(
      `${Technician_DeliveryReports}/order/${orderId}/verify-code`,
      { code }
    );
    console.log('✅ گزارش تحویل تایید شد:', response.data);
    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در تایید گزارش تحویل:', error.response?.data || error.message);
    if (error.response) {
      console.log('❌ Status:', error.response.status);
      console.log('❌ Data:', error.response.data);
    }
    return handleError(error);
  }
};

/**
 * ارسال مجدد کد تایید گزارش تحویل (تکنسین)
 * فقط برای گزارش‌هایی که هنوز تایید نشده‌اند کار می‌کند
 */
export const resendDeliveryReportCode = async (orderId) => {
  try {
    console.log(`📧 ارسال مجدد کد تایید برای سفارش ${orderId}`);
    console.log(`${Technician_DeliveryReports}/order/${orderId}/resend-code`);

    const response = await api.post(
      `${Technician_DeliveryReports}/order/${orderId}/resend-code`
    );
    console.log('✅ کد تایید مجدداً ارسال شد:', response.data);
    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در ارسال مجدد کد تایید:', error.response?.data || error.message);
    if (error.response) {
      console.log('❌ Status:', error.response.status);
      console.log('❌ Data:', error.response.data);

      // مدیریت خطاهای خاص
      if (error.response.data?.error_code === 'REPORT_ALREADY_VERIFIED') {
        return {
          success: false,
          message: 'این گزارش قبلاً تایید شده است.',
          error_code: 'REPORT_ALREADY_VERIFIED'
        };
      }
    }
    return handleError(error);
  }
};

/**
 * ثبت پایان کار
 */
export const endOrder = async (orderId) => {
  try {
    console.log(`🏁 ثبت پایان کار برای سفارش ${orderId}`);
    const response = await api.post(
      `${Technician_Orders}/${orderId}/end`
    );
    console.log('✅ پایان کار ثبت شد:', response.data);
    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در ثبت پایان کار:', error.response?.data || error.message);
    if (error.response) {
      console.log('❌ Status:', error.response.status);
      console.log('❌ Data:', error.response.data);
    }
    return handleError(error);
  }
};

/**
 * Handle API errors and format them consistently
 */
const handleError = (error) => {
  console.log('API Error:', error);

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
    console.log('❌ API connection test failed:', error.message);

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
        'Accept-Language': lang
      },
      timeout: 10000,
    });

    console.log('📡 Fetch response status:', fetchResponse.status);
    console.log('📡 Fetch response headers:', fetchResponse.headers);

    if (!fetchResponse.ok) {
      const errorText = await fetchResponse.text();
      console.log('❌ Fetch error response body:', errorText);
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
    console.log('❌ Test expertises endpoint failed:', error);
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
    console.log('❌ API Error for expertises:', error.message);
    console.log('❌ Request URL was:', `${BASE_URL}/expertises`);
    if (error.response) {
      console.log('❌ Error response:', error.response.status, error.response.data);
    }
    return handleError(error);
  }
};

/**
 * Register a new technician with multipart form data
 */
export const registerTechnician = async (formData, resumeFile = null) => {
  try {

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
      // Platform-specific file handling
      if (typeof resumeFile.uri === 'string' && resumeFile.uri.startsWith('data:')) {
        const base64Data = resumeFile.uri.split(',')[1];
        const mimeType = resumeFile.type || 'application/octet-stream';
        const blob = base64ToBlob(base64Data, mimeType);
        multipartData.append('resume', blob, resumeFile.name || 'resume.pdf');
        console.log('✅ فایل رزومه به صورت Blob اضافه شد');
      } else {
        multipartData.append('resume', {
          uri: resumeFile.uri,
          name: resumeFile.name || 'resume.pdf',
          type: resumeFile.mimeType || resumeFile.type || 'application/pdf',
        });
      }
    } else {
      console.log('⚠️ هیچ فایل رزومه‌ای انتخاب نشده');
    }

    for (const [key, value] of formData.entries()) {
      if (key !== 'password') {
        console.log(`  ${key}:`, typeof value === 'object' ? 'file' : value);
      }
    }

    const response = await api.post('/technician/register', multipartData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept-Language': lang
      },
      timeout: 60000, // 60 seconds for file upload
    });

    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// 🌐 Helper function to convert base64 to Blob (for Web)
const base64ToBlob = (base64, mimeType) => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
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


    const response = await api.post('/technician/login', requestBody);

    const result = handleResponse(response);

    // Store token and user data if login successful
    if (result.success && result.data.token) {
      await AsyncStorage.setItem('userToken', result.data.token);
      // Store the complete data structure (not just technician)
      await AsyncStorage.setItem('userData', JSON.stringify(result.data));
    }

    return result;
  } catch (error) {

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
    console.log('❌ خطا در logout API:', error);
    // Clear authentication data even if logout API fails
    console.log('🗑️ پاک کردن توکن احراز هویت (در صورت خطا)...');
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('savedReferralCode');
    await AsyncStorage.removeItem('savedPassword');
    console.log('✅ توکن پاک شد (userData حفظ شد برای بار بعد)');
    return handleError(error);
  }
};


export const notesAPI = {
  // Get all user notes
  getAll: async () => {
    try {
      const response = await api.get('/technician/notes');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get note by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/technician/notes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new note
  create: async (data) => {
    try {
      const response = await api.post('/technician/notes', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update note
  update: async (id, data) => {
    try {
      const response = await api.put(`/technician/notes/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete note
  delete: async (id) => {
    try {
      const response = await api.delete(`/technician/notes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export const infoAPI = {
  // Get FAQs
  getFAQs: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.INFO.FAQS);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Terms
  getTerms: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.INFO.TERMS);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Privacy Policy
  getPrivacy: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.INFO.PRIVACY);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Warranty Information
  getWarranty: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.INFO.WARRANTY);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
/**
 * Validate technician token
 */
export const validateToken = async () => {
  try {
    const response = await api.post('/technician/validate-token');
    return handleResponse(response);
  } catch (error) {
    console.log('❌ توکن نامعتبر یا منقضی شده');
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
    console.log('❌ خطا در ارسال کد بازیابی:', error.response?.data || error.message);
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
    console.log('❌ خطا در تأیید کد:', error.response?.data || error.message);
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
    console.log('❌ خطا در تغییر رمز عبور:', error.response?.data || error.message);
    console.log('📥 پاسخ کامل خطا:', JSON.stringify(error.response?.data, null, 2));
    return handleError(error);
  }
};

/**
 * Get technician profile
 */
export const getTechnicianProfile = async () => {
  try {
    console.log('🔍 درخواست دریافت پروفایل تکنسین...');
    console.log('📍 Endpoint: GET /technician/profile');
    const response = await api.get('/technician/profile');
    console.log('✅ پاسخ دریافت شد:', response.status);
    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت پروفایل:', error.message);
    console.log('📍 Endpoint: GET /technician/profile');
    if (error.response) {
      console.log('📥 Status:', error.response.status);
      console.log('📥 Data:', error.response.data);
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

      // 🌐 Platform-specific photo handling
      const isWeb = Platform.OS === 'web';

      console.log('📸 اطلاعات عکس برای ارسال:', {
        uri: profilePhoto.uri,
        name: profilePhoto.name,
        type: profilePhoto.type,
        hasFile: !!profilePhoto.file,
        platform: Platform.OS
      });

      // Add profile photo based on platform
      if (isWeb && profilePhoto.file) {
        // Web: Use File object directly
        console.log('🌐 استفاده از File object برای Web');
        formData.append('profile_photo', profilePhoto.file, profilePhoto.name || 'profile.jpg');
      } else {
        // Mobile: Use URI-based object
        console.log('� استفاده از URI object برای Mobile');
        const photoData = {
          uri: profilePhoto.uri,
          name: profilePhoto.name || 'profile.jpg',
          type: profilePhoto.type || 'image/jpeg',
        };
        formData.append('profile_photo', photoData);
      }

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
          'Accept-Language': lang
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
          'Accept-Language': lang
        },
      });

      console.log('✅ اطلاعات شخصی به‌روز شد:', response.data);
      return handleResponse(response);
    }
  } catch (error) {
    console.log('❌ خطا در به‌روزرسانی اطلاعات شخصی:', error.response?.data || error.message);
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
        'Accept-Language': lang
      },
    });

    console.log('✅ اطلاعات خودرو به‌روز شد:', response.data);
    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در به‌روزرسانی اطلاعات خودرو:', error.response?.data || error.message);
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
        'Accept-Language': lang
      },
    });

    console.log('✅ اطلاعات بانکی به‌روز شد:', response.data);
    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در به‌روزرسانی اطلاعات بانکی:', error.response?.data || error.message);
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
        'Accept-Language': lang
      },
    });

    console.log('✅ رمز عبور تغییر یافت:', response.data);
    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در تغییر رمز عبور:', error.response?.data || error.message);
    return handleError(error);
  }
};

// =============================================================================
// TECHNICIAN ORDERS APIs
// =============================================================================

/**
 * Get list of technician orders with optional filters
 * @param {String} status - Filter by status (pending, in_progress, completed, cancelled)
 * @param {Number} page - Page number (default: 1)
 * @param {Number} perPage - Items per page (default: 15)
 */
export const getTechnicianOrders = async (status = null, page = 1, perPage = 15) => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (status?.toString()) params.append('status', status?.toString());
    params.append('page', page);
    params.append('per_page', perPage);

    const queryString = params.toString();
    const endpoint = `/technician/orders${queryString ? '?' + queryString : ''}`;

    console.log('📍 Endpoint:', endpoint);

    const response = await api.get(endpoint);

    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Get single order details by ID
 * @param {Number} orderId - Order ID
 */
export const getTechnicianOrderById = async (orderId) => {
  try {
    const response = await api.get(`/technician/orders/${orderId}/detail`);
    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت جزئیات سفارش:', error.response?.data || error.message);
    if (error.response) {
      console.log('❌ Status:', error.response.status);
      console.log('❌ Data:', error.response.data);
    }
    return handleError(error);
  }
};

/**
 * ثبت توضیحات تکنسین
 * @param {number} orderId - شناسه سفارش
 * @param {Object} data - داده‌های توضیحات شامل technician_des, date, time
 * @returns {Promise<Object>} پاسخ API
 */
export const submitTechnicianDescription = async (orderId, data) => {
  try {
    const response = await api.post(`/technician/orders/${orderId}/technician-description`, data);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

/**
 * ثبت زمان حرکت (راه افتادن)
 * @param {number} orderId - شناسه سفارش
 * @returns {Promise<Object>} پاسخ API
 */
export const setOffToOrder = async (orderId) => {
  try {
    const response = await api.post(`/technician/orders/${orderId}/set-off`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

/**
 * ثبت زمان رسیدن
 * @param {number} orderId - شناسه سفارش
 * @returns {Promise<Object>} پاسخ API
 */
export const arriveToOrder = async (orderId) => {
  try {
    const response = await api.post(`/technician/orders/${orderId}/arrive`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

/**
 * ثبت گزارش محصول توسط تکنسین
 * @param {Object} data - اطلاعات گزارش محصول
 * @returns {Promise<Object>} پاسخ API
 */
export const createOrderReport = async (data) => {
  try {
    const response = await api.post('/technician/order-reports', data);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

/**
 * به‌روزرسانی گزارش محصول
 * @param {number} reportId - شناسه گزارش
 * @param {Object} data - اطلاعات به‌روزرسانی شده
 * @returns {Promise<Object>} پاسخ API
 */
export const updateOrderReport = async (reportId, data) => {
  try {
    const response = await api.put(`/technician/order-reports/${reportId}`, data);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

/**
 * مشاهده گزارش محصول
 * @param {number} reportId - شناسه گزارش
 * @returns {Promise<Object>} پاسخ API
 */
export const getOrderReport = async (reportId) => {
  try {
    const response = await api.get(`/technician/order-reports/${reportId}`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

/**
 * مشاهده گزارش بر اساس سفارش
 * @param {number} orderId - شناسه سفارش
 * @returns {Promise<Object>} پاسخ API
 */
export const getOrderReportByOrderId = async (orderId) => {
  try {
    const response = await api.get(`/order-reports/by-order/${orderId}`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

/**
 * ارسال سفارش به لوپ
 * @param {number} orderId - شناسه سفارش
 * @returns {Promise<Object>} پاسخ API
 */
export const sendOrderToLoop = async (orderId) => {
  try {
    const response = await api.post(`/technician/orders/${orderId}/send-to-loop`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};
export const doneInPlace = async (orderId, data) => {
  try {
    const response = await api.post(`/technician/orders/${orderId}/done-in-place`, data);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

/**
 * به‌روزرسانی اطلاعات لوپ
 * @param {number} orderId - شناسه سفارش
 * @param {Object} data - اطلاعات لوپ (duration, loop_cost_estimate, loop_description)
 * @returns {Promise<Object>} پاسخ API
 */
export const updateLoopInfo = async (orderId, data) => {
  try {
    const response = await api.patch(`/technician/orders/${orderId}/loop-info`, data);
    return handleResponse(response);
  } catch (error) {
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
    console.log('Error clearing auth data:', error);
    return false;
  }
};

// ==================== Chat APIs ====================

/**
 * دریافت لیست چت‌های تکنسین
 */
export const getTechnicianChats = async () => {
  try {
    console.log('📋 دریافت لیست چت‌های تکنسین');
    const response = await api.get('/technician/chats');
    console.log('✅ لیست چت‌ها دریافت شد:', response.data);
    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت لیست چت‌ها:', error.response?.data || error.message);
    return handleError(error);
  }
};

/**
 * دریافت پیام‌های یک چت با کاربر
 */
export const getTechnicianChatMessages = async (userId) => {
  try {
    console.log(`📨 دریافت پیام‌های چت با کاربر ${userId}`);
    const response = await api.get('/technician/chats/messages', {
      params: { user_id: userId }
    });
    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت پیام‌ها:', error.response?.data || error.message);
    return handleError(error);
  }
};

/**
 * ارسال پیام به کاربر
 */
export const sendTechnicianMessage = async (userId, message) => {
  try {
    console.log(`📤 ارسال پیام به کاربر ${userId}:`, message);
    const response = await api.post('/technician/chats/send', {
      user_id: userId,
      message: message
    });
    console.log('✅ پیام ارسال شد:', response.data);
    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در ارسال پیام:', error.response?.data || error.message);
    if (error.response?.status === 403) {
      return {
        success: false,
        message: error.response.data.message || 'چت بسته شده است. سفارش فعالی وجود ندارد.',
        error_code: 'CHAT_CLOSED'
      };
    }
    return handleError(error);
  }
};

/**
 * علامت‌گذاری پیام‌ها به عنوان خوانده شده
 */
export const markTechnicianMessagesAsRead = async (userId) => {
  try {
    console.log(`✓ علامت‌گذاری پیام‌های کاربر ${userId} به عنوان خوانده شده`);
    const response = await api.post('/technician/chats/mark-read', {
      user_id: userId
    });
    console.log('✅ پیام‌ها خوانده شدند:', response.data);
    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در علامت‌گذاری پیام‌ها:', error.response?.data || error.message);
    // این خطا را نادیده می‌گیریم چون critical نیست
    return { success: false, silent: true };
  }
};

/**
 * لغو سفارش توسط تکنسین
 */
export const cancelOrderByTechnician = async (orderId, cancelReason) => {
  try {
    console.log(`✓ درخواست لغو سفارش ${orderId} توسط تکنسین`);
    const response = await api.post(`/technician/orders/${orderId}/cancel`, {
      technician_cancel_reason: cancelReason
    });
    console.log('✅ سفارش با موفقیت لغو شد:', response.data);
    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در لغو سفارش:', error.response?.data || error.message);

    // مدیریت خطاهای مختلف
    if (error.response?.status === 404) {
      throw new Error('سفارش مورد نظر یافت نشد یا به شما تعلق ندارد');
    } else if (error.response?.status === 409) {
      const errorCode = error.response?.data?.error;
      if (errorCode === 'ORDER_ALREADY_STARTED') {
        throw new Error('امکان لغو سفارش پس از شروع کار وجود ندارد');
      } else if (errorCode === 'ORDER_ALREADY_COMPLETED') {
        throw new Error('امکان لغو سفارش تکمیل شده وجود ندارد');
      } else if (errorCode === 'ORDER_ALREADY_CANCELLED') {
        throw new Error('این سفارش قبلاً لغو شده است');
      }
    } else if (error.response?.status === 422) {
      throw new Error('لطفاً دلیل لغو را وارد کنید');
    }

    throw new Error(error.response?.data?.message || 'خطا در لغو سفارش. لطفاً دوباره تلاش کنید');
  }
};

/**
 * ثبت درخواست کمک اضطراری
 */
export const submitEmergencyHelp = async (orderId, emergencyHelp) => {
  try {
    console.log(`✓ ثبت درخواست کمک اضطراری برای سفارش ${orderId}`);
    const response = await api.post(`/technician/orders/${orderId}/emergency-help`, {
      emergency_help: emergencyHelp
    });
    console.log('✅ درخواست کمک اضطراری با موفقیت ثبت شد:', response.data);
    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در ثبت درخواست کمک اضطراری:', error.response?.data || error.message);

    // مدیریت خطاهای مختلف
    if (error.response?.status === 404) {
      throw new Error('سفارش مورد نظر یافت نشد');
    } else if (error.response?.status === 409) {
      const errorCode = error.response?.data?.error_code;
      if (errorCode === 'INVALID_ORDER_STATUS') {
        throw new Error('فقط سفارشات در حال انجام می‌توانند درخواست کمک اضطراری داشته باشند');
      } else if (errorCode === 'ORDER_NOT_STARTED') {
        throw new Error('برای ثبت درخواست کمک، ابتدا باید کار را شروع کرده باشید');
      }
    } else if (error.response?.status === 422) {
      throw new Error('لطفاً توضیحات درخواست را وارد کنید');
    }

    throw new Error(error.response?.data?.message || 'خطا در ثبت درخواست. لطفاً دوباره تلاش کنید');
  }
};

/**
 * ثبت نظر تکنسین در مورد سفارش
 * @param {number} orderId - شناسه سفارش
 * @param {string} technicianOpinion - نظر تکنسین (حداکثر 2000 کاراکتر)
 * @returns {Promise<Object>} پاسخ API
 */
export const submitTechnicianOpinion = async (orderId, technicianOpinion) => {
  try {
    console.log(`💬 ثبت نظر تکنسین برای سفارش #${orderId}...`);

    const response = await api.post(`${Technician_Orders}/${orderId}/technician-opinion`, {
      technician_opinion: technicianOpinion
    });

    console.log('✅ نظر تکنسین با موفقیت ثبت شد:', response.data);
    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در ثبت نظر تکنسین:', error.response?.data || error.message);

    const errorCode = error.response?.data?.error_code;

    if (error.response?.status === 404) {
      throw new Error('سفارش مورد نظر یافت نشد');
    } else if (error.response?.status === 409) {
      if (errorCode === 'ORDER_NOT_FINISHED') {
        throw new Error('فقط سفارشات تمام شده می‌توانند نظر تکنسین داشته باشند');
      }
      throw new Error('سفارش هنوز به اتمام نرسیده است');
    } else if (error.response?.status === 422) {
      throw new Error('لطفاً نظر خود را وارد کنید (حداکثر 2000 کاراکتر)');
    }

    throw new Error(error.response?.data?.message || 'خطا در ثبت نظر. لطفاً دوباره تلاش کنید');
  }
};

// =============================================================================
// EDUCATION REQUESTS APIs
// =============================================================================

/**
 * ثبت درخواست آموزش/مراجعه جدید
 * @param {Object} data - { section, description }
 * @returns {Promise<Object>} پاسخ API
 */
export const createEducationRequest = async (data) => {
  try {
    console.log('📝 ثبت درخواست جدید:', data);

    const response = await api.post('/technician/education-requests', data);
    console.log('✅ درخواست با موفقیت ثبت شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در ثبت درخواست:', error.response?.data || error.message);

    if (error.response?.status === 422) {
      const errors = error.response?.data?.errors;
      if (errors) {
        const errorMessages = Object.values(errors).flat().join('\n');
        throw new Error(errorMessages);
      }
      throw new Error('لطفاً تمام فیلدها را به درستی پر کنید');
    }

    throw new Error(error.response?.data?.message || 'خطا در ثبت درخواست. لطفاً دوباره تلاش کنید');
  }
};

/**
 * دریافت لیست درخواست‌های آموزش/مراجعه
 * @returns {Promise<Object>} پاسخ API
 */
export const getEducationRequests = async () => {
  try {
    console.log('📋 دریافت لیست درخواست‌ها');

    const response = await api.get('/technician/education-requests');
    console.log('✅ لیست درخواست‌ها دریافت شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت لیست درخواست‌ها:', error.response?.data || error.message);
    return handleError(error);
  }
};

/**
 * دریافت جزئیات یک درخواست آموزش/مراجعه
 * @param {number} requestId - شناسه درخواست
 * @returns {Promise<Object>} پاسخ API
 */
export const getEducationRequestById = async (requestId) => {
  try {
    console.log(`📋 دریافت جزئیات درخواست #${requestId}`);

    const response = await api.get(`/technician/education-requests/${requestId}`);
    console.log('✅ جزئیات درخواست دریافت شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت جزئیات درخواست:', error.response?.data || error.message);

    if (error.response?.status === 404) {
      throw new Error('درخواست مورد نظر یافت نشد');
    } else if (error.response?.status === 403) {
      throw new Error('دسترسی غیرمجاز');
    }

    return handleError(error);
  }
};

// Export the configured axios instance for custom requests
/**
 * ثبت درخواست مرخصی جدید
 * @param {Object} data - اطلاعات درخواست مرخصی
 * @returns {Promise<Object>} پاسخ API
 */
export const createLeaveRequest = async (data) => {
  try {
    console.log('📝 ثبت درخواست مرخصی:', data);

    const response = await api.post('/technician/leave-requests', data);
    console.log('✅ درخواست مرخصی ثبت شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در ثبت درخواست مرخصی:', error.response?.data || error.message);

    if (error.response?.status === 422) {
      const errors = error.response.data.errors;
      const firstError = Object.values(errors)[0][0];
      throw new Error(firstError);
    } else if (error.response?.status === 403) {
      throw new Error('دسترسی غیرمجاز');
    }

    return handleError(error);
  }
};

/**
 * دریافت لیست درخواست‌های مرخصی
 * @returns {Promise<Object>} پاسخ API
 */
export const getLeaveRequests = async () => {
  try {
    console.log('📋 دریافت لیست درخواست‌های مرخصی');

    const response = await api.get('/technician/leave-requests');
    console.log('✅ لیست درخواست‌های مرخصی دریافت شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت لیست درخواست‌های مرخصی:', error.response?.data || error.message);
    return handleError(error);
  }
};

/**
 * دریافت جزئیات یک درخواست مرخصی
 * @param {number} requestId - شناسه درخواست
 * @returns {Promise<Object>} پاسخ API
 */
export const getLeaveRequestById = async (requestId) => {
  try {
    console.log(`📋 دریافت جزئیات درخواست مرخصی #${requestId}`);

    const response = await api.get(`/technician/leave-requests/${requestId}`);
    console.log('✅ جزئیات درخواست مرخصی دریافت شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت جزئیات درخواست مرخصی:', error.response?.data || error.message);

    if (error.response?.status === 404) {
      throw new Error('درخواست مورد نظر یافت نشد');
    } else if (error.response?.status === 403) {
      throw new Error('دسترسی غیرمجاز');
    }

    return handleError(error);
  }
};

// =============================================================================
// DEBT REQUESTS APIs (تسهیلات / وام بدون بهره)
// =============================================================================

/**
 * ثبت درخواست وام/تسهیلات جدید
 * @param {Object} data - اطلاعات درخواست وام
 * @returns {Promise<Object>} پاسخ API
 */
export const createDebtRequest = async (data) => {
  try {
    console.log('💰 ثبت درخواست وام:', data);

    const response = await api.post('/technician/debt-requests', data);
    console.log('✅ درخواست وام ثبت شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در ثبت درخواست وام:', error.response?.data || error.message);

    if (error.response?.status === 422) {
      const errors = error.response.data.errors;
      const firstError = Object.values(errors)[0][0];
      throw new Error(firstError);
    } else if (error.response?.status === 403) {
      throw new Error('دسترسی غیرمجاز');
    }

    return handleError(error);
  }
};

/**
 * دریافت لیست درخواست‌های وام
 * @returns {Promise<Object>} پاسخ API
 */
export const getDebtRequests = async () => {
  try {
    console.log('📋 دریافت لیست درخواست‌های وام');

    const response = await api.get('/technician/debt-requests');
    console.log('✅ لیست درخواست‌های وام دریافت شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت لیست درخواست‌های وام:', error.response?.data || error.message);
    return handleError(error);
  }
};

/**
 * دریافت جزئیات یک درخواست وام
 * @param {number} requestId - شناسه درخواست
 * @returns {Promise<Object>} پاسخ API
 */
export const getDebtRequestById = async (requestId) => {
  try {
    console.log(`📋 دریافت جزئیات درخواست وام #${requestId}`);

    const response = await api.get(`/technician/debt-requests/${requestId}`);
    console.log('✅ جزئیات درخواست وام دریافت شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت جزئیات درخواست وام:', error.response?.data || error.message);

    if (error.response?.status === 404) {
      throw new Error('درخواست مورد نظر یافت نشد');
    } else if (error.response?.status === 403) {
      throw new Error('دسترسی غیرمجاز');
    }

    return handleError(error);
  }
};

// =============================================================================
// ============================= Transfer Requests =============================
// =============================================================================

/**
 * ثبت درخواست انتقال/سمت جدید
 * @param {Object} data - اطلاعات درخواست انتقال/سمت
 * @returns {Promise<Object>} پاسخ API
 */
export const createTransferRequest = async (data) => {
  try {
    console.log('🔄 ثبت درخواست انتقال/سمت:', data);

    const response = await api.post('/technician/transfer-requests', data);
    console.log('✅ درخواست انتقال/سمت ثبت شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در ثبت درخواست انتقال/سمت:', error.response?.data || error.message);

    if (error.response?.status === 422) {
      const errors = error.response.data.errors;
      const firstError = Object.values(errors)[0][0];
      throw new Error(firstError);
    } else if (error.response?.status === 403) {
      throw new Error('دسترسی غیرمجاز');
    }

    return handleError(error);
  }
};

/**
 * دریافت لیست درخواست‌های انتقال/سمت
 * @returns {Promise<Object>} پاسخ API
 */
export const getTransferRequests = async () => {
  try {
    console.log('📋 دریافت لیست درخواست‌های انتقال/سمت');

    const response = await api.get('/technician/transfer-requests');
    console.log('✅ لیست درخواست‌های انتقال/سمت دریافت شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت لیست درخواست‌های انتقال/سمت:', error.response?.data || error.message);
    return handleError(error);
  }
};

/**
 * دریافت جزئیات یک درخواست انتقال/سمت
 * @param {number} requestId - شناسه درخواست
 * @returns {Promise<Object>} پاسخ API
 */
export const getTransferRequestById = async (requestId) => {
  try {
    console.log(`📋 دریافت جزئیات درخواست انتقال/سمت #${requestId}`);

    const response = await api.get(`/technician/transfer-requests/${requestId}`);
    console.log('✅ جزئیات درخواست انتقال/سمت دریافت شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت جزئیات درخواست انتقال/سمت:', error.response?.data || error.message);

    if (error.response?.status === 404) {
      throw new Error('درخواست مورد نظر یافت نشد');
    } else if (error.response?.status === 403) {
      throw new Error('دسترسی غیرمجاز');
    }

    return handleError(error);
  }
};

// =============================================================================
// ============================= Manpower Requests =============================
// =============================================================================

/**
 * ثبت درخواست نیروی انسانی جدید
 * @param {Object} data - اطلاعات درخواست نیروی انسانی
 * @returns {Promise<Object>} پاسخ API
 */
export const createManpowerRequest = async (data) => {
  try {
    console.log('👥 ثبت درخواست نیروی انسانی:', data);

    const response = await api.post('/technician/manpower-requests', data);
    console.log('✅ درخواست نیروی انسانی ثبت شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در ثبت درخواست نیروی انسانی:', error.response?.data || error.message);

    if (error.response?.status === 422) {
      const errors = error.response.data.errors;
      const firstError = Object.values(errors)[0][0];
      throw new Error(firstError);
    } else if (error.response?.status === 403) {
      throw new Error('دسترسی غیرمجاز');
    }

    return handleError(error);
  }
};

/**
 * دریافت لیست درخواست‌های نیروی انسانی
 * @returns {Promise<Object>} پاسخ API
 */
export const getManpowerRequests = async () => {
  try {
    console.log('📋 دریافت لیست درخواست‌های نیروی انسانی');

    const response = await api.get('/technician/manpower-requests');
    console.log('✅ لیست درخواست‌های نیروی انسانی دریافت شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت لیست درخواست‌های نیروی انسانی:', error.response?.data || error.message);
    return handleError(error);
  }
};

/**
 * دریافت جزئیات یک درخواست نیروی انسانی
 * @param {number} requestId - شناسه درخواست
 * @returns {Promise<Object>} پاسخ API
 */
export const getManpowerRequestById = async (requestId) => {
  try {
    console.log(`📋 دریافت جزئیات درخواست نیروی انسانی #${requestId}`);

    const response = await api.get(`/technician/manpower-requests/${requestId}`);
    console.log('✅ جزئیات درخواست نیروی انسانی دریافت شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت جزئیات درخواست نیروی انسانی:', error.response?.data || error.message);

    if (error.response?.status === 404) {
      throw new Error('درخواست مورد نظر یافت نشد');
    } else if (error.response?.status === 403) {
      throw new Error('دسترسی غیرمجاز');
    }

    return handleError(error);
  }
};

// =============================================================================
// =========================== Termination Requests ============================
// =============================================================================

/**
 * ثبت درخواست قطع همکاری جدید
 * @param {Object} data - اطلاعات درخواست قطع همکاری
 * @returns {Promise<Object>} پاسخ API
 */
export const createTerminationRequest = async (data) => {
  try {
    console.log('🔌 ثبت درخواست قطع همکاری:', data);

    const response = await api.post('/technician/termination-requests', data);
    console.log('✅ درخواست قطع همکاری ثبت شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در ثبت درخواست قطع همکاری:', error.response?.data || error.message);

    if (error.response?.status === 422) {
      const errors = error.response.data.errors;
      const firstError = Object.values(errors)[0][0];
      throw new Error(firstError);
    } else if (error.response?.status === 403) {
      throw new Error('دسترسی غیرمجاز');
    }

    return handleError(error);
  }
};

/**
 * دریافت لیست درخواست‌های قطع همکاری
 * @returns {Promise<Object>} پاسخ API
 */
export const getTerminationRequests = async () => {
  try {
    console.log('📋 دریافت لیست درخواست‌های قطع همکاری');

    const response = await api.get('/technician/termination-requests');
    console.log('✅ لیست درخواست‌های قطع همکاری دریافت شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت لیست درخواست‌های قطع همکاری:', error.response?.data || error.message);
    return handleError(error);
  }
};

/**
 * دریافت جزئیات یک درخواست قطع همکاری
 * @param {number} requestId - شناسه درخواست
 * @returns {Promise<Object>} پاسخ API
 */
export const getTerminationRequestById = async (requestId) => {
  try {
    console.log(`📋 دریافت جزئیات درخواست قطع همکاری #${requestId}`);

    const response = await api.get(`/technician/termination-requests/${requestId}`);
    console.log('✅ جزئیات درخواست قطع همکاری دریافت شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت جزئیات درخواست قطع همکاری:', error.response?.data || error.message);

    if (error.response?.status === 404) {
      throw new Error('درخواست مورد نظر یافت نشد');
    } else if (error.response?.status === 403) {
      throw new Error('دسترسی غیرمجاز');
    }

    return handleError(error);
  }
};

// =============================================================================
// ============================== Transactions =================================
// =============================================================================

/**
 * دریافت لیست تراکنش‌های تکنسین
 * @param {Object} filters - فیلترهای تاریخ (اختیاری)
 * @param {string} filters.date - تاریخ خاص (YYYY-MM-DD)
 * @param {string} filters.from_date - از تاریخ (YYYY-MM-DD)
 * @param {string} filters.to_date - تا تاریخ (YYYY-MM-DD)
 * @returns {Promise<Object>} پاسخ API
 */
export const getTransactions = async (filters = {}) => {
  try {
    console.log('💰 دریافت لیست تراکنش‌ها با فیلترها:', filters);

    // ساخت query parameters
    const params = new URLSearchParams();
    if (filters.date) params.append('date', filters.date);
    if (filters.from_date) params.append('from_date', filters.from_date);
    if (filters.to_date) params.append('to_date', filters.to_date);

    const queryString = params.toString();
    const url = queryString ? `/technician/transactions?${queryString}` : '/technician/transactions';

    const response = await api.get(url);
    console.log('✅ لیست تراکنش‌ها دریافت شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت لیست تراکنش‌ها:', error.response?.data || error.message);

    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('دسترسی غیرمجاز');
    }

    return handleError(error);
  }
};

// =====================================================
// Archive Images APIs
// =====================================================

export const uploadArchiveImages = async (images) => {
  try {
    console.log('📤 آپلود تصاویر آرشیو...', images.length, 'تصویر');

    const formData = new FormData();
    const isWeb = Platform.OS === 'web';

    images.forEach((image, index) => {
      // برای وب از فایل اصلی استفاده می‌کنیم
      if (isWeb && image.file) {
        console.log(`📸 آماده‌سازی تصویر ${index + 1} (Web):`, {
          fileName: image.fileName || image.file.name,
          type: image.file.type
        });

        formData.append('images[]', image.file, image.fileName || image.file.name);
      } else {
        // برای موبایل از روش قبلی استفاده می‌کنیم
        const uriParts = image.uri.split('/');
        const fileName = image.fileName || uriParts[uriParts.length - 1];

        // تشخیص mime type
        let mimeType = 'image/jpeg';
        if (fileName.toLowerCase().endsWith('.png')) {
          mimeType = 'image/png';
        } else if (fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg')) {
          mimeType = 'image/jpeg';
        } else if (fileName.toLowerCase().endsWith('.webp')) {
          mimeType = 'image/webp';
        }

        console.log(`📸 آماده‌سازی تصویر ${index + 1} (Mobile):`, { fileName, mimeType, uri: image.uri });

        formData.append('images[]', {
          uri: image.uri,
          type: mimeType,
          name: fileName || `photo_${Date.now()}_${index}.jpg`,
        });
      }
    });

    console.log('📦 FormData آماده شد، در حال ارسال...');

    const response = await api.post('/technician/archive-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept-Language': lang
      },
      timeout: 60000, // 60 ثانیه برای آپلود
    });

    console.log('✅ تصاویر آپلود شدند:', response.data);
    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در آپلود تصاویر:', error.response?.data || error.message);
    console.log('❌ جزئیات خطا:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });

    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('دسترسی غیرمجاز');
    }

    if (error.response?.status === 422) {
      const errors = error.response?.data?.errors;
      if (errors) {
        const errorMessages = Object.values(errors).flat().join('\n');
        throw new Error(errorMessages);
      }
    }

    return handleError(error);
  }
};

export const getArchiveImages = async () => {
  try {
    console.log('📥 دریافت لیست تصاویر آرشیو...');

    const response = await api.get('/technician/archive-images');
    console.log('✅ لیست تصاویر دریافت شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت لیست تصاویر:', error.response?.data || error.message);

    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('دسترسی غیرمجاز');
    }

    return handleError(error);
  }
};

export const deleteArchiveImage = async (imageId) => {
  try {
    console.log('🗑️ حذف تصویر:', imageId);

    const response = await api.delete(`/technician/archive-images/${imageId}`);
    console.log('✅ تصویر حذف شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در حذف تصویر:', error.response?.data || error.message);

    if (error.response?.status === 404) {
      throw new Error('تصویر یافت نشد یا دسترسی به حذف آن را ندارید');
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('دسترسی غیرمجاز');
    }

    return handleError(error);
  }
};

// =====================================================
// Incentive Plans APIs
// =====================================================

export const getIncentivePlans = async () => {
  try {
    console.log('🎁 دریافت لیست طرح‌های تشویقی...');

    const response = await api.get('/technician/incentive-plans');
    console.log('✅ لیست طرح‌های تشویقی دریافت شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت لیست طرح‌های تشویقی:', error.response?.data || error.message);

    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('دسترسی غیرمجاز');
    }

    return handleError(error);
  }
};

// =====================================================
// Poll/Feedback APIs
// =====================================================

export const checkPollStatus = async () => {
  try {
    console.log('🔍 بررسی وضعیت ثبت نظر...');

    const response = await api.get('/technician/poll/check');
    console.log('✅ وضعیت نظر دریافت شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در بررسی وضعیت نظر:', error.response?.data || error.message);

    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('دسترسی غیرمجاز');
    }

    return handleError(error);
  }
};

export const submitPoll = async (pollData) => {
  try {
    console.log('📝 ثبت نظرات و پیشنهادات...');

    const response = await api.post('/technician/poll', pollData);
    console.log('✅ نظرات ثبت شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در ثبت نظرات:', error.response?.data || error.message);

    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'شما قبلاً نظر خود را ثبت کرده‌اید');
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('دسترسی غیرمجاز');
    }

    if (error.response?.status === 422) {
      const errors = error.response?.data?.errors;
      if (errors) {
        const errorMessages = Object.values(errors).flat().join('\n');
        throw new Error(errorMessages);
      }
      throw new Error(error.response?.data?.message || 'خطا در اعتبارسنجی داده‌ها');
    }

    return handleError(error);
  }
};

/**
 * Get yearly income chart data
 */
export const getYearlyIncomeChart = async (year) => {
  try {
    console.log('════════════════════════════════════════');
    console.log('📊 شروع درخواست نمودار درآمد سالانه');
    console.log('════════════════════════════════════════');
    console.log('📥 پارامتر ورودی year:', year);
    console.log('📥 نوع year:', typeof year);
    console.log('📥 آیا number است؟', typeof year === 'number');

    // ساخت URL با یا بدون query parameter
    let url = '/technician/transactions/yearly-income-chart';

    // فقط اگر year یک عدد معتبر باشه، به URL اضافه کن
    if (typeof year === 'number' && !isNaN(year) && year > 0) {
      url = `${url}?year=${year}`;
      console.log('✅ year به عنوان query parameter اضافه شد:', year);
    } else {
      console.log('⚠️ year معتبر نیست، بدون query parameter ارسال می‌شود');
      console.log('   - year value:', year);
      console.log('   - isNaN:', isNaN(year));
    }

    console.log('🔗 URL نهایی:', url);
    console.log('🔗 Full URL:', `${api.defaults.baseURL}${url}`);
    console.log('════════════════════════════════════════');

    const response = await api.get(url);

    console.log('════════════════════════════════════════');
    console.log('✅ پاسخ موفق دریافت شد');
    console.log('📊 Status:', response.status);
    console.log('📊 Data:', JSON.stringify(response.data, null, 2));
    console.log('════════════════════════════════════════');

    return handleResponse(response);
  } catch (error) {
    console.log('════════════════════════════════════════');
    console.log('❌ خطا در دریافت نمودار');
    console.log('❌ Message:', error.message);
    console.log('❌ Status:', error.response?.status);
    console.log('❌ Response Data:', JSON.stringify(error.response?.data, null, 2));
    console.log('❌ Request URL:', error.config?.url);
    console.log('════════════════════════════════════════');

    return handleError(error);
  }
};

/**
 * دریافت لیست گزارش‌های تخلف ادمین
 * Get list of admin violation reports for the technician
 * @returns {Promise<Object>} پاسخ API با لیست گزارش‌ها
 */
export const getAdminReportViolations = async () => {
  try {
    console.log('📋 دریافت لیست گزارش‌های تخلف ادمین...');

    const response = await api.get(API_ENDPOINTS.ADMIN_VIOLATIONS.LIST);

    console.log('✅ لیست گزارش‌های تخلف دریافت شد:', {
      total: response.data.total,
      count: response.data.data?.length
    });

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت لیست گزارش‌های تخلف:', error.response?.data || error.message);
    return handleError(error);
  }
};

/**
 * دریافت جزئیات یک گزارش تخلف
 * Get details of a specific violation report
 * @param {number} reportId - شناسه گزارش
 * @returns {Promise<Object>} پاسخ API با جزئیات گزارش
 */
export const getAdminReportViolationById = async (reportId) => {
  try {
    console.log(`📋 دریافت جزئیات گزارش تخلف #${reportId}...`);

    const endpoint = API_ENDPOINTS.ADMIN_VIOLATIONS.DETAIL.replace('{id}', reportId);
    const response = await api.get(endpoint);

    console.log('✅ جزئیات گزارش تخلف دریافت شد:', response.data.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت جزئیات گزارش تخلف:', error.response?.data || error.message);

    if (error.response?.status === 404) {
      throw new Error('گزارش تخلف یافت نشد');
    } else if (error.response?.status === 403) {
      throw new Error('دسترسی غیرمجاز');
    }

    return handleError(error);
  }
};

/**
 * ارسال پاسخ به گزارش تخلف
 * Reply to an admin violation report
 * @param {number} reportId - شناسه گزارش
 * @param {string} responseText - متن پاسخ (حداکثر 5000 کاراکتر)
 * @returns {Promise<Object>} پاسخ API
 */
export const replyToAdminReportViolation = async (reportId, responseText) => {
  try {
    console.log(`💬 ارسال پاسخ به گزارش تخلف #${reportId}...`);
    console.log('📝 طول متن پاسخ:', responseText?.length || 0);

    const endpoint = API_ENDPOINTS.ADMIN_VIOLATIONS.REPLY.replace('{id}', reportId);
    const response = await api.post(endpoint, { response: responseText });

    console.log('✅ پاسخ با موفقیت ثبت شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در ارسال پاسخ:', error.response?.data || error.message);

    if (error.response?.status === 422) {
      const errors = error.response?.data?.errors;
      if (errors) {
        const errorMessages = Object.values(errors).flat().join('\n');
        throw new Error(errorMessages);
      }
      throw new Error('لطفاً متن پاسخ را به درستی وارد کنید');
    } else if (error.response?.status === 403) {
      throw new Error('امکان پاسخ‌دهی به این گزارش وجود ندارد');
    } else if (error.response?.status === 400) {
      throw new Error('شما قبلاً به این گزارش پاسخ داده‌اید');
    }

    return handleError(error);
  }
};

/**
 * دریافت لیست پیام‌های پشتیبانی (تیکت‌ها)
 * Get support messages/tickets list
 * @returns {Promise<Object>} لیست پیام‌ها
 */
export const getTicketsList = async () => {
  try {
    console.log('📨 دریافت لیست پیام‌های پشتیبانی...');

    const response = await api.get('/technician/tickets');

    console.log('✅ لیست پیام‌ها دریافت شد:', {
      total: response.data?.total || 0,
      messages: response.data?.data?.length || 0
    });

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت پیام‌ها:', error.response?.data || error.message);
    return handleError(error);
  }
};

/**
 * ارسال پیام جدید به پشتیبانی
 * Send new support message
 * @param {string} message - متن پیام (حداکثر 5000 کاراکتر)
 * @returns {Promise<Object>} پیام ارسال شده
 */
export const sendTicketMessage = async (message) => {
  try {
    console.log('📤 ارسال پیام جدید...');
    console.log('📝 طول پیام:', message?.length || 0);

    const response = await api.post('/technician/tickets', { message });

    console.log('✅ پیام با موفقیت ارسال شد:', response.data);

    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در ارسال پیام:', error.response?.data || error.message);

    if (error.response?.status === 422) {
      const errors = error.response?.data?.errors;
      if (errors) {
        const errorMessages = Object.values(errors).flat().join('\n');
        throw new Error(errorMessages);
      }
      throw new Error('لطفاً متن پیام را به درستی وارد کنید');
    }

    return handleError(error);
  }
};

/**
 * دریافت تعداد پیام‌های خوانده نشده
 * Get unread messages count
 * @returns {Promise<Object>} تعداد پیام‌های خوانده نشده
 */
export const getUnreadTicketsCount = async () => {
  try {
    const response = await api.get('/technician/tickets/unread-count');
    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت تعداد پیام‌های خوانده نشده:', error.message);
    return handleError(error);
  }
};

/**
 * دریافت لیست سازمان‌ها با تعداد سفارشات
 * Get list of organizations with order counts
 * @returns {Promise<Object>} لیست سازمان‌ها و آمار
 */
export const getOrganizationsList = async () => {
  try {
    console.log('📋 دریافت لیست سازمان‌ها...');
    const response = await api.get('/technician/organization-orders/organizations');
    console.log('✅ لیست سازمان‌ها دریافت شد:', response.data);
    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت لیست سازمان‌ها:', error.response?.data || error.message);
    return handleError(error);
  }
};

/**
 * دریافت سفارشات یک سازمان خاص
 * Get orders for a specific organization
 * @param {number} organizationId - شناسه سازمان
 * @returns {Promise<Object>} لیست سفارشات سازمان
 */
export const getOrganizationOrders = async (organizationId) => {
  try {
    console.log('📦 دریافت سفارشات سازمان:', organizationId);
    const response = await api.get(`/technician/organization-orders/organizations/${organizationId}/orders`);
    console.log('✅ سفارشات سازمان دریافت شد:', response.data);
    return handleResponse(response);
  } catch (error) {
    console.log('❌ خطا در دریافت سفارشات سازمان:', error.response?.data || error.message);
    return handleError(error);
  }
};

export default api;
