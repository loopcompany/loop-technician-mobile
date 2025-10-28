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
      multipartData.append('resume', {
        uri: resumeFile.uri,
        name: resumeFile.name || 'resume.pdf',
        type: resumeFile.type || 'application/pdf',
      });
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
export const loginTechnician = async (phone, password) => {
  try {
    const response = await api.post('/technician/login', {
      phone,
      password,
    });
    
    const result = handleResponse(response);
    
    // Store token and user data if login successful
    if (result.success && result.data.token) {
      await AsyncStorage.setItem('userToken', result.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(result.data.user));
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
    const response = await api.post('/technician/logout');
    
    // Clear stored data regardless of API response
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    
    return handleResponse(response);
  } catch (error) {
    // Clear stored data even if logout API fails
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    return handleError(error);
  }
};

/**
 * Get technician profile
 */
export const getTechnicianProfile = async () => {
  try {
    const response = await api.get('/technician/profile');
    return handleResponse(response);
  } catch (error) {
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