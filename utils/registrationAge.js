import jalaali from 'jalaali-js';

// Sign-up age rule (edits list 1405/07/03, item 22): applicants must be born in
// (current Jalali year − 18) or earlier. The limit moves forward on 1 Farvardin:
// in 1405 the last allowed birth year is 1387, from 1406/01/01 it is 1388.
// The rule works on Jalali years on purpose — comparing Gregorian years would
// reject someone born in Dey 1387 (January 2009) during 1405.
export const MIN_REGISTRATION_AGE = 18;
export const MAX_REGISTRATION_AGE = 80;

const currentJalaliYear = (now) =>
  jalaali.toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate()).jy;

/** Last allowed birth year for sign-up (Jalali). */
export const getMaxRegistrationBirthYear = (now = new Date()) =>
  currentJalaliYear(now) - MIN_REGISTRATION_AGE;

/** Last allowed birth date for sign-up, as 'jYYYY/jMM/jDD' (end of Esfand). */
export const getMaxRegistrationBirthDate = (now = new Date()) => {
  const year = getMaxRegistrationBirthYear(now);
  return `${year}/12/${jalaali.jalaaliMonthLength(year, 12)}`;
};

const toLatinDigits = (text) =>
  String(text).replace(/[۰-۹٠-٩]/g, (ch) => {
    const code = ch.charCodeAt(0);
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
  });

/**
 * Parses a Jalali ('1379/08/27') or Gregorian ('2000-11-17') date string into
 * a Jalali { jy, jm, jd }, or null when it is not a real date.
 */
export const parseBirthDateToJalali = (value) => {
  const match = toLatinDigits(value ?? '').trim().match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (y < 1700) {
    return jalaali.isValidJalaaliDate(y, m, d) ? { jy: y, jm: m, jd: d } : null;
  }
  const g = new Date(y, m - 1, d);
  if (g.getFullYear() !== y || g.getMonth() !== m - 1 || g.getDate() !== d) return null;
  return jalaali.toJalaali(y, m, d);
};

/** @returns {{ isValid: boolean, message: string }} */
export const validateRegistrationBirthDate = (birthDate, now = new Date()) => {
  if (!birthDate) {
    return { isValid: false, message: 'تاریخ تولد الزامی است' };
  }
  const parsed = parseBirthDateToJalali(birthDate);
  if (!parsed) {
    return { isValid: false, message: 'فرمت تاریخ تولد صحیح نیست' };
  }
  const maxYear = getMaxRegistrationBirthYear(now);
  if (parsed.jy > maxYear) {
    return { isValid: false, message: `ثبت‌نام برای متولدین سال ${maxYear} و قبل از آن امکان‌پذیر است` };
  }
  if (currentJalaliYear(now) - parsed.jy > MAX_REGISTRATION_AGE) {
    return { isValid: false, message: `سن باید حداکثر ${MAX_REGISTRATION_AGE} سال باشد` };
  }
  return { isValid: true, message: 'تاریخ تولد معتبر است' };
};
