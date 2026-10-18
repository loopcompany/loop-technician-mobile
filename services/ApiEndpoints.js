import { uri } from './URL';

// API Endpoints Configuration
export const API_ENDPOINTS = {
  // Base URL (from URL.js)
  BASE_URL: uri, // http://192.168.21.123:8000/api
  // Info endpoints (Public APIs)
  INFO: {
    FAQS: '/info/faqs',
    TERMS: '/info/terms', 
    PRIVACY: '/info/privacy',
    WARRANTY: '/info/warranties',
  },
  // Technician saved addresses (same shape as the user app's /addresses)
  ADDRESSES: {
    LIST: '/technician/addresses',
    DETAIL: '/technician/addresses/{id}',
  },
  // Technician Admin Report Violations
  ADMIN_VIOLATIONS: {
    LIST: '/technician/admin-report-violations',
    DETAIL: '/technician/admin-report-violations/{id}',
    REPLY: '/technician/admin-report-violations/{id}/reply',
  },
  // Account security: signed-in devices and sessions (docs/Backend-Account-Security.md)
  SECURITY: {
    DEVICES: '/technician/security/devices',
    DEVICE: '/technician/security/devices/{id}',
    LOGOUT_OTHERS: '/technician/security/logout-others',
    SESSIONS: '/technician/security/sessions',
    SESSION: '/technician/security/sessions/{id}',
    CURRENT_DEVICE: '/technician/security/current-device',
  },
  // Field-service daily report of an organization order (docs/Backend-Field-Service-Daily-Report.md)
  FIELD_SERVICE: {
    REPORT: '/technician/orders/{order}/field-service',
    START: '/technician/orders/{order}/field-service/start',
    VISIT: '/technician/orders/{order}/field-service/{visit}',
    PHOTOS: '/technician/orders/{order}/field-service/{visit}/photos',
    PHOTO: '/technician/orders/{order}/field-service/{visit}/photos/{photo}',
  },
};

// Helper function to build full URL
export const buildApiUrl = (endpoint) => {
  return `${API_ENDPOINTS.BASE_URL}${endpoint}`;
};

// Helper function to replace path parameters
export const buildEndpointWithParams = (endpoint, params = {}) => {
  let url = endpoint;
  Object.keys(params).forEach(key => {
    url = url.replace(`{${key}}`, params[key]);
  });
  return url;
};
