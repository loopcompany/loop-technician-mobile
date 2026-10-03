import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import ScreenHeaders from '../../components/ScreenHeaders';
import CustomStatusBar from '../../components/CustomStatusBar';
import { createStyles } from '../../styles/NewStyles';
import { themeColor10 } from '../../theme/Color';
import { securityAPI } from '../../services/Api';
import { signOut } from '../../services/signOut';
import { showAlert, showToastOrAlert } from '../../helpers/Common';
import {
  useSecurityList,
  pickList,
  errorText,
  formatDateTime,
  deviceTitle,
  deviceIcon,
  osLabel,
  orDash,
  InfoRow,
  Badge,
  CardHeader,
  DangerAction,
  ListState,
  createSharedStyles,
} from './securityShared';

const pickSessions = pickList('sessions');

const byCurrentThenRecent = (a, b) => {
  if (!!a.is_current !== !!b.is_current) return a.is_current ? -1 : 1;
  return String(b.last_used_at ?? b.created_at ?? '').localeCompare(String(a.last_used_at ?? a.created_at ?? ''));
};

// Account security › Session management: the account's active tokens/sessions.
// Unlike "Active devices" (where the account is signed in), this lists every
// session the system holds for the account, with the option to end each one.
export default function SessionsScreen() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const NewStyles = useMemo(() => createStyles(i18n.language), [i18n.language]);
  const shared = useMemo(() => createSharedStyles(NewStyles), [NewStyles]);
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);

  const { loading, refreshing, items, error, reload, refresh } = useSecurityList(securityAPI.getSessions, pickSessions);
  const sessions = useMemo(() => [...items].sort(byCurrentThenRecent), [items]);
  const [busyId, setBusyId] = useState(null);

  const endSession = async (session) => {
    setBusyId(session.id);
    const result = await securityAPI.endSession(session.id);
    setBusyId(null);
    if (result.success) {
      showToastOrAlert(t('The session was ended.'));
      reload();
    } else {
      showAlert(t('Error'), errorText(result, t), [], t);
    }
  };

  const confirmEnd = (session) => {
    showAlert(
      t('End session'),
      session.is_current
        ? t('This is the session of the device you are using. Ending it signs you out of this device.')
        : t('The device using this session will be signed out of your account.'),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('End session'),
          style: 'destructive',
          onPress: () => (session.is_current ? signOut(dispatch) : endSession(session)),
        },
      ],
      t
    );
  };

  const statusText = (session) => (session.status === 'expired' ? t('Expired') : t('Active status'));

  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'off' }}>
      <CustomStatusBar />
      <ScreenHeaders title={t('Session management')} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <ListState
          loading={loading}
          error={error}
          isEmpty={sessions.length === 0}
          emptyText={t('No active session was found.')}
          onRetry={reload}
        />

        {!loading && sessions.length > 0 && (
          <Text style={[NewStyles.text10, styles.summary]}>
            {t('{{n}} active session(s) on your account.', { n: sessions.length })}
          </Text>
        )}

        {!loading && sessions.map((session) => (
          <View key={String(session.id)} style={[shared.card, session.is_current && shared.cardCurrent]}>
            <CardHeader icon={deviceIcon(session.device_type)} title={deviceTitle(session, t)}>
              <Badge
                text={session.is_current ? t('Current device') : statusText(session)}
                tone={session.is_current ? 'current' : session.status === 'expired' ? 'danger' : 'active'}
              />
            </CardHeader>

            <InfoRow label={t('Session ID')} value={orDash(session.id)} />
            <InfoRow label={t('Device')} value={deviceTitle(session, t)} />
            <InfoRow label={t('Operating system')} value={osLabel(session)} />
            <InfoRow label={t('App version')} value={orDash(session.app_version)} />
            <InfoRow label="IP" value={orDash(session.last_ip || session.ip_address)} />
            <InfoRow label={t('Session created')} value={formatDateTime(session.created_at, t, i18n.language)} />
            <InfoRow label={t('Last activity')} value={formatDateTime(session.last_used_at, t, i18n.language)} />
            <InfoRow
              label={t('Expires')}
              value={session.expires_at ? formatDateTime(session.expires_at, t, i18n.language) : t('No expiry')}
            />
            <InfoRow label={t('Session status')} value={statusText(session)} />
            <InfoRow label={t('Current device')} value={session.is_current ? t('Yes') : t('No')} />

            <DangerAction
              testID={`session-end-${session.id}`}
              title={t('End session')}
              loading={busyId === session.id}
              disabled={busyId !== null && busyId !== session.id}
              onPress={() => confirmEnd(session)}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 130,
  },
  summary: {
    fontSize: 13,
    color: themeColor10.bgColor(0.6),
    marginBottom: 10,
  },
});
