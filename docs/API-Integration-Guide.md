# Technician Registration & Login API Integration Guide

This guide shows how to use the implemented API services for technician registration and login functionality.

## 🚀 Quick Start

### 1. Registration Flow

```javascript
import { 
  registerTechnician, 
  verifyPhoneNumber, 
  getExpertises 
} from '../services/Api';
import { validateTechnicianRegistration } from '../utils/validation';

// Example registration process
const handleTechnicianRegistration = async (formData) => {
  try {
    // 1. Validate form data
    const validation = validateTechnicianRegistration(formData);
    if (!validation.isValid) {
      Alert.alert('خطا', Object.values(validation.errors)[0]);
      return;
    }

    // 2. Submit registration
    const result = await registerTechnician(formData);
    
    if (result.success) {
      // 3. Navigate to phone verification
      navigation.navigate('PhoneVerification', {
        phone: formData.mobile,
        technicianId: result.data.technician_id
      });
    } else {
      Alert.alert('خطا', result.message);
    }
  } catch (error) {
    Alert.alert('خطا', 'خطا در ثبت نام');
  }
};
```

### 2. Phone Verification

```javascript
// Verify phone number with SMS code
const handleVerifyPhone = async (phone, code) => {
  try {
    const result = await verifyPhoneNumber(phone, code);
    
    if (result.success) {
      // Phone verified successfully
      // Password sent to user's phone
      navigation.navigate('LoginScreen', { phone, verified: true });
    } else {
      Alert.alert('خطا', result.message);
    }
  } catch (error) {
    Alert.alert('خطا', 'خطا در تأیید شماره تلفن');
  }
};
```

### 3. Login with Authentication Context

```javascript
import { useAuth } from '../contexts/AuthContext';

const LoginScreen = () => {
  const { login, loading } = useAuth();
  
  const handleLogin = async (phone, password) => {
    try {
      const result = await login(phone, password);
      
      if (result.success) {
        // User logged in successfully
        // Navigate to main app
        navigation.replace('FolderScreen');
      } else {
        Alert.alert('خطا', result.message);
      }
    } catch (error) {
      Alert.alert('خطا', 'خطا در ورود');
    }
  };
  
  // Component JSX...
};
```

## 📋 Form Data Structure

### Registration Form Data
```javascript
const registrationFormData = {
  // Personal Information
  name: "احمد محمدی",
  melicode: "1234567890",
  birth_date: "1990-01-01",
  father_name: "علی",
  issued_from: "تهران",
  serial_number: "123",
  marital_status: "مجرد", // مجرد | متاهل
  military_status: "پایان خدمت", // معاف | در حال خدمت | پایان خدمت
  education_status: "کارشناسی",
  
  // Contact Information
  telephone: "02112345678",
  mobile: "09123456789",
  email: "user@example.com",
  
  // Address Information
  home_postal_code: "1234567890",
  city: "تهران",
  region: "منطقه 1",
  home_address: "آدرس کامل منزل",
  
  // Additional Information
  id_card_number: "123456789",
  licence_date: "2025-12-31",
  vehicle_type: "خودرو",
  other_referral_code: "ABC12345",
  
  // Skills Information
  idea: "ایده و خلاقیت تکنسین",
  software_skill: "مهارت‌های نرم‌افزاری",
  hardware_skill: "مهارت‌های سخت‌افزاری", 
  software_weakness: "نقاط ضعف نرم‌افزاری",
  hardware_weakness: "نقاط ضعف سخت‌افزاری",
  resume: "رزومه تکنسین",
  expertise_ids: [1, 2, 3] // Array of expertise IDs
};
```

## 🔒 Authentication Management

### Using Auth Context

```javascript
import { useAuth } from '../contexts/AuthContext';

const SomeComponent = () => {
  const { 
    isLoggedIn, 
    user, 
    loading, 
    login, 
    logout, 
    updateUser 
  } = useAuth();

  // Check if user is logged in
  if (isLoggedIn) {
    return <AuthenticatedApp />;
  } else {
    return <LoginScreen />;
  }
};
```

### Protecting Routes

```javascript
const ProtectedScreen = ({ navigation }) => {
  const { isLoggedIn, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigation.replace('LoginScreen');
    }
  }, [isLoggedIn, loading]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View>
      {/* Protected content */}
    </View>
  );
};
```

## 📱 API Response Handling

All API calls return a consistent response format:

```javascript
// Success Response
{
  success: true,
  data: { /* response data */ },
  message: "عملیات با موفقیت انجام شد"
}

// Error Response
{
  success: false,
  message: "خطا در انجام عملیات",
  error_code: "VALIDATION_ERROR",
  errors: { /* field-specific errors */ }
}
```

### Error Handling Pattern

```javascript
const handleApiCall = async () => {
  try {
    const result = await someApiFunction();
    
    if (result.success) {
      // Handle success
      console.log('Success:', result.data);
    } else {
      // Handle API error
      if (result.errors) {
        // Field validation errors
        Object.keys(result.errors).forEach(field => {
          console.log(`${field}: ${result.errors[field]}`);
        });
      } else {
        // General error
        Alert.alert('خطا', result.message);
      }
    }
  } catch (error) {
    // Handle network/unexpected errors
    console.log('Network error:', error);
    Alert.alert('خطا', 'خطا در ارتباط با سرور');
  }
};
```

## 📋 Validation Utilities

### Using Validation Functions

```javascript
import { 
  validateMeliCode,
  validateMobilePhone,
  validateEmail,
  validateTechnicianRegistration 
} from '../utils/validation';

// Individual field validation
const phoneValidation = validateMobilePhone("09123456789");
if (!phoneValidation.isValid) {
  Alert.alert('خطا', phoneValidation.message);
}

// Complete form validation
const validation = validateTechnicianRegistration(formData);
if (!validation.isValid) {
  // Show first error
  const firstError = Object.values(validation.errors)[0];
  Alert.alert('خطا', firstError);
}
```

### Custom Validation

```javascript
const validateCustomField = (value) => {
  if (!value) {
    return { isValid: false, message: 'فیلد الزامی است' };
  }
  
  if (value.length < 3) {
    return { isValid: false, message: 'حداقل 3 کاراکتر وارد کنید' };
  }
  
  return { isValid: true, message: 'معتبر است' };
};
```

## 🗂️ File Upload

### Resume Upload

```javascript
import { uploadResume } from '../services/Api';
import * as DocumentPicker from 'expo-document-picker';

const handleResumeUpload = async () => {
  try {
    // Pick document
    const result = await DocumentPicker.getDocumentAsync({ 
      type: '*/*' 
    });
    
    if (result.type === 'success') {
      // Upload to server
      const fileName = result.name || result.uri.split('/').pop();
      const fileType = result.mimeType || 'application/octet-stream';
      
      const uploadResult = await uploadResume(
        result.uri, 
        fileName, 
        fileType
      );
      
      if (uploadResult.success) {
        Alert.alert('موفقیت', 'رزومه با موفقیت بارگذاری شد');
      } else {
        Alert.alert('خطا', uploadResult.message);
      }
    }
  } catch (error) {
    Alert.alert('خطا', 'خطا در بارگذاری فایل');
  }
};
```

## 🔧 Configuration

### API Base URL

Update in `services/URL.js`:

```javascript
export const mainUri = 'https://your-domain.com';
export const uri = 'https://your-domain.com/api';
export const imageUri = 'https://your-domain.com/storage';
```

### Request Timeout

Modify in `services/Api.js`:

```javascript
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
```

## 🎯 Best Practices

### 1. Loading States
Always show loading indicators during API calls:

```javascript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    // API call
  } finally {
    setLoading(false);
  }
};
```

### 2. Form Validation
Validate forms before submitting:

```javascript
const handleSubmit = async () => {
  if (!validateForm()) return;
  // Submit form
};
```

### 3. Error Handling
Always handle both success and error cases:

```javascript
if (result.success) {
  // Success handling
} else {
  // Error handling
  Alert.alert('خطا', result.message);
}
```

### 4. User Feedback
Provide clear feedback to users:

```javascript
Alert.alert(
  'موفقیت',
  'عملیات با موفقیت انجام شد',
  [{ text: 'تایید', onPress: () => navigation.goBack() }]
);
```

This implementation provides a complete, production-ready API integration system for technician registration and authentication! 🎉