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
  // Technician Admin Report Violations
  ADMIN_VIOLATIONS: {
    LIST: '/technician/admin-report-violations',
    DETAIL: '/technician/admin-report-violations/{id}',
    REPLY: '/technician/admin-report-violations/{id}/reply',
  }
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
