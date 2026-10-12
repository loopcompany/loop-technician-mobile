// Shared pieces of the "Account security" screens (technician edits — account
// security): data loading, formatting of devices/sessions as the backend sends
// them (docs/Backend-Account-Security.md), and the small UI blocks they share.
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { toJalaali } from 'jalaali-js';

import { createStyles } from '../../styles/NewStyles';
import { themeColor0, themeColor3, themeColor4, themeColor6, themeColor7, themeColor10 } from '../../theme/Color';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

/**
 * Loads `loader()` (a securityAPI call) whenever the screen gains focus.
 * `pick` extracts the list from the response data.
 */
export const useSecurityList = (loader, pick) => {
  const [state, setState] = useState({ loading: true, refreshing: false, items: [], error: null });
  const loaded = useRef(false);

  const load = useCallback(async (refreshing = false) => {
    setState((prev) => ({ ...prev, loading: !refreshing && !loaded.current, refreshing }));
    const result = await loader();
    if (result?.success) {
      loaded.current = true;
      setState({ loading: false, refreshing: false, items: pick(result.data), error: null });
    } else {
      setState((prev) => ({ ...prev, loading: false, refreshing: false, error: result }));
    }
  }, [loader, pick]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  return { ...state, reload: load, refresh: () => load(true) };
};

// Accepts both `{ devices: [...] }` and a bare array.
export const pickList = (key) => (data) => {
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.[key]) ? data[key] : [];
};

export const errorText = (result, t) => {
  if (result?.status === 404) return t('This feature is not yet available on the server.');
  if (result?.error_code === 'NETWORK_ERROR') return t('Server did not respond. Please check your internet connection.');
  return result?.message || t('Something went wrong. Please try again.');
};

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

const pad = (n) => String(n).padStart(2, '0');

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const dayStart = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

/** "Today, 18:42" / "Yesterday, 09:10" / "1405/07/10, 18:42" (Jalali in Persian). */
export const formatDateTime = (value, t, lang) => {
  const date = parseDate(value);
  if (!date) return '—';

  const isFa = lang === 'fa';
  const separator = isFa ? '، ' : ', ';
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  const days = Math.round((dayStart(new Date()) - dayStart(date)) / 86400000);

  let day;
  if (days === 0) {
    day = t('Today');
  } else if (days === 1) {
    day = t('Yesterday');
  } else if (isFa) {
    const { jy, jm, jd } = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
    day = `${jy}/${pad(jm)}/${pad(jd)}`;
  } else {
    day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
  return `${day}${separator}${time}`;
};

const capitalize = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : '');

// Android only reports the model code (e.g. "SM-A225F"); the backend may add
// the marketing name ("Galaxy A22") as `device_name`.
const marketingName = (item) => String(item?.device_name ?? '').trim();

/** "Samsung Galaxy A22", "Apple iPhone 13" — without repeating the brand. */
export const deviceTitle = (item, t) => {
  const brand = capitalize(String(item?.device_brand ?? '').trim());
  const model = marketingName(item) || String(item?.device_model ?? '').trim();
  if (brand && model) {
    return model.toLowerCase().startsWith(brand.toLowerCase()) ? model : `${brand} ${model}`;
  }
  return brand || model || t('Unknown device');
};

/** "Galaxy A22 (SM-A225F)" when the marketing name is known, else the model code. */
export const modelLabel = (item) => {
  const name = marketingName(item);
  const model = String(item?.device_model ?? '').trim();
  if (name && model && name.toLowerCase() !== model.toLowerCase()) return `${name} (${model})`;
  return name || model || '—';
};

const DEVICE_TYPES = {
  phone: { label: 'Mobile phone', icon: 'phone-portrait-outline' },
  tablet: { label: 'Tablet', icon: 'tablet-portrait-outline' },
  desktop: { label: 'Computer', icon: 'desktop-outline' },
  web: { label: 'Web browser', icon: 'globe-outline' },
  tv: { label: 'TV', icon: 'tv-outline' },
};

export const deviceTypeLabel = (type, t) => t(DEVICE_TYPES[type]?.label ?? 'Unknown');
export const deviceIcon = (type) => DEVICE_TYPES[type]?.icon ?? 'hardware-chip-outline';

export const osLabel = (item) =>
  [item?.os_name, item?.os_version].filter(Boolean).join(' ') || '—';

export const orDash = (value) => (value === null || value === undefined || value === '' ? '—' : String(value));

// ---------------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------------

export const useSharedStyles = () => {
  const { i18n } = useTranslation();
  const NewStyles = useMemo(() => createStyles(i18n.language), [i18n.language]);
  const styles = useMemo(() => createSharedStyles(NewStyles), [NewStyles]);
  return { NewStyles, styles, isRTL: i18n.language === 'fa' };
};

/** A "label: value" line of a device or session card. */
export const InfoRow = ({ label, value }) => {
  const { NewStyles, styles, isRTL } = useSharedStyles();
  return (
    <View style={[NewStyles.rowWrapper, styles.infoRow]}>
      <Text style={[NewStyles.text10, styles.infoLabel]}>{label}</Text>
      {/* The value sits on the edge opposite the label. */}
      <Text style={[NewStyles.text10, styles.infoValue, { textAlign: isRTL ? 'left' : 'right' }]} selectable>
        {value}
      </Text>
    </View>
  );
};

/** Small pill: green for the current device, gray otherwise. */
export const Badge = ({ text, tone = 'neutral' }) => {
  const { NewStyles, styles } = useSharedStyles();
  const background = {
    current: themeColor7.bgColor(0.15),
    active: themeColor0.bgColor(0.1),
    danger: themeColor6.bgColor(0.12),
    neutral: themeColor3.bgColor(0.15),
  }[tone];
  const color = {
    current: themeColor7.bgColor(1),
    active: themeColor0.bgColor(1),
    danger: themeColor6.bgColor(1),
    neutral: themeColor10.bgColor(0.6),
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <Text style={[NewStyles.text10, styles.badgeText, { color }]}>{text}</Text>
    </View>
  );
};

/** Card header: device icon, title and badges. */
export const CardHeader = ({ icon, title, children }) => {
  const { NewStyles, styles } = useSharedStyles();
  return (
    <View style={[NewStyles.row, styles.cardHeader]}>
      <View style={[styles.cardIcon, NewStyles.center]}>
        <Ionicons name={icon} size={22} color={themeColor0.bgColor(1)} />
      </View>
      <Text style={[NewStyles.title10, styles.cardTitle]} numberOfLines={2}>{title}</Text>
      {children}
    </View>
  );
};

/** Red outlined action at the bottom of a card. */
export const DangerAction = ({ title, onPress, loading, disabled, testID }) => {
  const { NewStyles, styles } = useSharedStyles();
  return (
    <TouchableOpacity
      testID={testID}
      style={[NewStyles.row, NewStyles.center, styles.dangerAction, (disabled || loading) && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={themeColor6.bgColor(1)} />
      ) : (
        <>
          <Ionicons name="log-out-outline" size={18} color={themeColor6.bgColor(1)} />
          <Text style={[NewStyles.title6, styles.dangerText]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

/** Loading / error / empty placeholder. Returns null when there is content. */
export const ListState = ({ loading, error, isEmpty, emptyText, onRetry }) => {
  const { NewStyles, styles } = useSharedStyles();
  const { t } = useTranslation();

  if (loading) {
    return (
      <View style={[styles.state, NewStyles.center]}>
        <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
      </View>
    );
  }
  if (error && isEmpty) {
    return (
      <View style={[styles.state, NewStyles.center]}>
        <Ionicons name="cloud-offline-outline" size={40} color={themeColor3.bgColor(1)} />
        <Text style={[NewStyles.text10, styles.stateText]}>{errorText(error, t)}</Text>
        <TouchableOpacity style={styles.retry} onPress={() => onRetry?.()}>
          <Text style={NewStyles.title4}>{t('Try again')}</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (isEmpty) {
    return (
      <View style={[styles.state, NewStyles.center]}>
        <Ionicons name="shield-checkmark-outline" size={40} color={themeColor3.bgColor(1)} />
        <Text style={[NewStyles.text10, styles.stateText]}>{emptyText}</Text>
      </View>
    );
  }
  return null;
};

export const createSharedStyles = (NewStyles) => StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: themeColor3.bgColor(0.2),
  },
  cardCurrent: {
    borderColor: themeColor7.bgColor(0.6),
  },
  cardHeader: {
    gap: 10,
    marginBottom: 8,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: themeColor0.bgColor(0.1),
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
  },
  infoRow: {
    paddingVertical: 5,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: themeColor3.bgColor(0.25),
  },
  infoLabel: {
    fontSize: 13,
    color: themeColor10.bgColor(0.55),
  },
  infoValue: {
    flexShrink: 1,
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    textAlign: 'center',
  },
  dangerAction: {
    marginTop: 12,
    height: 42,
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: themeColor6.bgColor(0.6),
  },
  dangerText: {
    fontSize: 14,
  },
  disabled: {
    opacity: 0.5,
  },
  state: {
    paddingVertical: 60,
    gap: 12,
  },
  stateText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retry: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: themeColor0.bgColor(1),
  },
});
