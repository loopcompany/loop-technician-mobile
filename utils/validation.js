/**
 * Validation utilities for technician registration and login forms
 */

/**
 * Validate Iranian national ID (Meli Code)
 */
export const validateMeliCode = (meliCode) => {
  if (!meliCode || meliCode.length !== 10) {
    return { isValid: false, message: 'کد ملی باید 10 رقم باشد' };
  }

  // Check if all digits are the same
  const allSame = meliCode.split('').every(digit => digit === meliCode[0]);
  if (allSame) {
    return { isValid: false, message: 'کد ملی نامعتبر است' };
  }

  // Validate check digit
  const checkDigit = parseInt(meliCode.charAt(9));
  let sum = 0;
  
  for (let i = 0; i < 9; i++) {
    sum += parseInt(meliCode.charAt(i)) * (10 - i);
  }
  
  const remainder = sum % 11;
  const expectedCheckDigit = remainder < 2 ? remainder : 11 - remainder;
  
  if (checkDigit !== expectedCheckDigit) {
    return { isValid: false, message: 'کد ملی نامعتبر است' };
  }

  return { isValid: true, message: 'کد ملی معتبر است' };
};

/**
 * Validate Iranian mobile phone number
 */
export const validateMobilePhone = (phone) => {
  const phoneRegex = /^09[0-9]{9}$/;
  
  console.log('📱 validateMobilePhone called with:', {
    phone,
    phoneType: typeof phone,
    phoneLength: phone?.length,
    regexTest: phoneRegex.test(phone)
  });
  
  if (!phone) {
    return { isValid: false, message: 'شماره تلفن الزامی است' };
  }
  
  if (!phoneRegex.test(phone)) {
    return { isValid: false, message: 'فرمت شماره تلفن صحیح نیست (09xxxxxxxxx)' };
  }
  
  return { isValid: true, message: 'شماره تلفن معتبر است' };
};

/**
 * Validate Iranian landline phone number
 */
export const validateLandlinePhone = (phone) => {
  // Tehran: 021xxxxxxxx, Other cities: 0xxxxxxxxxx
  const landlineRegex = /^0[1-9][0-9]{8,9}$/;
  
  if (!phone) {
    return { isValid: false, message: 'شماره تلفن ثابت الزامی است' };
  }
  
  if (!landlineRegex.test(phone)) {
    return { isValid: false, message: 'فرمت شماره تلفن ثابت صحیح نیست' };
  }
  
  return { isValid: true, message: 'شماره تلفن ثابت معتبر است' };
};

/**
 * Validate email address
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, message: 'آدرس ایمیل الزامی است' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'فرمت ایمیل صحیح نیست' };
  }
  
  return { isValid: true, message: 'ایمیل معتبر است' };
};

/**
 * Validate Iranian postal code
 */
export const validatePostalCode = (postalCode) => {
  const postalCodeRegex = /^[0-9]{10}$/;
  
  if (!postalCode) {
    return { isValid: false, message: 'کد پستی الزامی است' };
  }
  
  if (!postalCodeRegex.test(postalCode)) {
    return { isValid: false, message: 'کد پستی باید 10 رقم باشد' };
  }
  
  return { isValid: true, message: 'کد پستی معتبر است' };
};

/**
 * Convert Persian/Shamsi date to Gregorian date
 */
export const convertShamsiToGregorian = (shamsiDate) => {
  if (!shamsiDate) return null;
  
  // Handle different formats: 1379/08/27, 1379-08-27, 13790827
  const cleanDate = shamsiDate.replace(/[-\/]/g, '/');
  const parts = cleanDate.split('/');
  
  if (parts.length !== 3) return null;
  
  const persianYear = parseInt(parts[0]);
  const persianMonth = parseInt(parts[1]);
  const persianDay = parseInt(parts[2]);
  
  // Validate Persian date ranges
  if (persianYear < 1300 || persianYear > 1450) return null;
  if (persianMonth < 1 || persianMonth > 12) return null;
  if (persianDay < 1 || persianDay > 31) return null;
  
  // Simple conversion (approximate)
  // For more accurate conversion, you could use a proper Persian calendar library
  let gregorianYear = persianYear + 621;  // تغییر از const به let
  let gregorianMonth = persianMonth + 3;
  let gregorianDay = persianDay + 21;
  
  // Adjust for month overflow
  if (gregorianMonth > 12) {
    gregorianMonth -= 12;
    gregorianYear += 1;
  }
  
  // Create a rough Gregorian date
  return new Date(gregorianYear, gregorianMonth - 1, gregorianDay);
};

/**
 * Validate birth date (supports both Shamsi and Gregorian)
 */
export const validateBirthDate = (birthDate) => {
  if (!birthDate) {
    return { isValid: false, message: 'تاریخ تولد الزامی است' };
  }
  
  let date;
  
  // Check if it's a Persian date (starts with 13 or 14)
  if (birthDate.match(/^1[34]/)) {
    date = convertShamsiToGregorian(birthDate);
    if (!date) {
      return { isValid: false, message: 'فرمت تاریخ شمسی صحیح نیست (مثال: 1379/08/27)' };
    }
  } else {
    // Try as Gregorian date
    date = new Date(birthDate);
  }
  
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  
  if (isNaN(date.getTime())) {
    return { isValid: false, message: 'فرمت تاریخ تولد صحیح نیست' };
  }
  
  if (age < 18 || age > 80) {
    return { isValid: false, message: 'سن باید بین 18 تا 80 سال باشد' };
  }
  
  return { isValid: true, message: 'تاریخ تولد معتبر است' };
};

/**
 * Validate license date (supports Shamsi format)
 */
export const validateLicenseDate = (licenseDate) => {
  if (!licenseDate) {
    return { isValid: false, message: 'تاریخ گواهی‌نامه الزامی است' };
  }
  
  // Check if it's a Persian date (should start with 14 for modern licenses)
  if (licenseDate.match(/^14/)) {
    const date = convertShamsiToGregorian(licenseDate);
    if (!date) {
      return { isValid: false, message: 'فرمت تاریخ گواهی‌نامه صحیح نیست (مثال: 1408/06/20)' };
    }
    return { isValid: true, message: 'تاریخ گواهی‌نامه معتبر است' };
  } else {
    return { isValid: false, message: 'تاریخ گواهی‌نامه باید با 14 شروع شود (مثال: 1408/06/20)' };
  }
};

/**
 * Validate required text field
 */
export const validateRequiredText = (value, fieldName, minLength = 2, maxLength = 255) => {
  if (!value || value.trim().length === 0) {
    return { isValid: false, message: `${fieldName} الزامی است` };
  }
  
  if (value.trim().length < minLength) {
    return { isValid: false, message: `${fieldName} باید حداقل ${minLength} کاراکتر باشد` };
  }
  
  if (value.trim().length > maxLength) {
    return { isValid: false, message: `${fieldName} باید حداکثر ${maxLength} کاراکتر باشد` };
  }
  
  return { isValid: true, message: `${fieldName} معتبر است` };
};

/**
 * Validate SMS verification code
 */
export const validateVerificationCode = (code) => {
  const codeRegex = /^[0-9]{4,6}$/;
  
  if (!code) {
    return { isValid: false, message: 'کد تأیید الزامی است' };
  }
  
  if (!codeRegex.test(code)) {
    return { isValid: false, message: 'کد تأیید باید 4 تا 6 رقم باشد' };
  }
  
  return { isValid: true, message: 'کد تأیید معتبر است' };
};

/**
 * Validate password
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'رمز عبور الزامی است' };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: 'رمز عبور باید حداقل 6 کاراکتر باشد' };
  }
  
  return { isValid: true, message: 'رمز عبور معتبر است' };
};

/**
 * Comprehensive validation for technician registration form
 */
export const validateTechnicianRegistration = (formData) => {
  const errors = {};
  
  // Required fields validation (همه فیلدها الزامی به جز resume)
  const requiredFields = [
    { key: 'name', name: 'نام و نام خانوادگی' },
    { key: 'melicode', name: 'کد ملی' },
    { key: 'birth_date', name: 'تاریخ تولد' },
    { key: 'father_name', name: 'نام پدر' },
    { key: 'issued_from', name: 'محل صدور' },
    { key: 'serial_number', name: 'شماره شناسنامه' },
    { key: 'marital_status', name: 'وضعیت تأهل' },
    { key: 'military_status', name: 'وضعیت نظام وظیفه' },
    { key: 'education_status', name: 'وضعیت تحصیلات' },
    { key: 'telephone', name: 'تلفن ثابت' },
    { key: 'mobile', name: 'تلفن همراه' },
    { key: 'email', name: 'آدرس ایمیل' },
    { key: 'id_card_number', name: 'شماره کارت شناسایی' },
    { key: 'licence_date', name: 'تاریخ اعتبار گواهینامه' },
    { key: 'vehicle_type', name: 'نوع وسیله نقلیه' },
    { key: 'home_postal_code', name: 'کد پستی' },
    { key: 'city', name: 'شهر' },
    { key: 'region', name: 'منطقه' },
    { key: 'home_address', name: 'آدرس منزل' },
    { key: 'idea', name: 'ایده / خلاقیت' },
    { key: 'software_skill', name: 'تسلط نرم‌افزار' },
    { key: 'hardware_skill', name: 'تسلط سخت‌افزار' },
    { key: 'software_weakness', name: 'نقطه ضعف نرم‌افزار' },
    { key: 'hardware_weakness', name: 'نقطه ضعف سخت‌افزار' },
  ];
  
  // Check required fields
  requiredFields.forEach(field => {
    const validation = validateRequiredText(formData[field.key], field.name);
    if (!validation.isValid) {
      errors[field.key] = validation.message;
    }
  });
  
  // Phone validation - mobile is required, phone is optional
  const hasPhone = formData.phone && formData.phone.trim();
  const hasMobile = formData.mobile && formData.mobile.trim();
  
  console.log('📱 Phone validation debug:', {
    phone: formData.phone,
    mobile: formData.mobile,
    hasPhone,
    hasMobile
  });
  
  // Mobile is required
  if (!hasMobile) {
    errors.mobile = 'شماره تلفن همراه الزامی است';
  } else {
    // Validate mobile (required field)
    const mobileValidation = validateMobilePhone(formData.mobile);
    console.log('📱 Mobile validation:', mobileValidation);
    if (!mobileValidation.isValid) {
      errors.mobile = mobileValidation.message;
    }
  }
  
  // Validate phone only if provided (optional field)
  if (hasPhone) {
    const phoneValidation = validateMobilePhone(formData.phone);
    console.log('📱 Phone validation:', phoneValidation);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.message;
    }
  }
  
  // Other specific validations
  if (formData.melicode) {
    const meliValidation = validateMeliCode(formData.melicode);
    if (!meliValidation.isValid) {
      errors.melicode = meliValidation.message;
    }
  }
  
  if (formData.telephone) {
    const telephoneValidation = validateLandlinePhone(formData.telephone);
    if (!telephoneValidation.isValid) {
      errors.telephone = telephoneValidation.message;
    }
  }
  
  if (formData.email) {
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.message;
    }
  }
  
  if (formData.birth_date) {
    const birthDateValidation = validateBirthDate(formData.birth_date);
    if (!birthDateValidation.isValid) {
      errors.birth_date = birthDateValidation.message;
    }
  }
  
  if (formData.licence_date) {
    const licenseValidation = validateLicenseDate(formData.licence_date);
    if (!licenseValidation.isValid) {
      errors.licence_date = licenseValidation.message;
    }
  }
  
  if (formData.home_postal_code) {
    const postalCodeValidation = validatePostalCode(formData.home_postal_code);
    if (!postalCodeValidation.isValid) {
      errors.home_postal_code = postalCodeValidation.message;
    }
  }
  
  // Check expertise_ids (حداقل یک تخصص)
  if (!formData.expertise_ids || !Array.isArray(formData.expertise_ids) || formData.expertise_ids.length === 0) {
    errors.expertise_ids = 'لطفاً حداقل یک تخصص انتخاب کنید';
  }
  
  // Check enum values (flexible matching)
  const maritalStatusOptions = ['مجرد', 'متأهل', 'متاهل']; // Support both forms
  if (formData.marital_status && !maritalStatusOptions.includes(formData.marital_status)) {
    errors.marital_status = 'وضعیت تأهل نامعتبر است';
  }
  
  const militaryStatusOptions = ['معاف', 'در حال خدمت', 'پایان خدمت'];
  if (formData.military_status && !militaryStatusOptions.includes(formData.military_status)) {
    errors.military_status = 'وضعیت نظام وظیفه نامعتبر است';
  }
  
  const vehicleTypeOptions = ['موتور سیکلت', 'خودرو', 'دوچرخه', 'پیاده'];
  if (formData.vehicle_type && !vehicleTypeOptions.includes(formData.vehicle_type)) {
    errors.vehicle_type = 'نوع وسیله نقلیه نامعتبر است';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate login form
 */
export const validateLoginForm = (phone, password) => {
  const errors = {};
  
  const phoneValidation = validateMobilePhone(phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.message;
  }
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};