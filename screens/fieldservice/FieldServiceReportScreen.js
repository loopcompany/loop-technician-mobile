import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import Ionicons from '@expo/vector-icons/Ionicons';

import ScreenHeaders from '../../components/ScreenHeaders';
import CustomStatusBar from '../../components/CustomStatusBar';
import Button from '../../components/Button';
import { themeColor0, themeColor3, themeColor4, themeColor6, themeColor10, themeColor11 } from '../../theme/Color';
import { fieldServiceAPI } from '../../services/Api';
import { showAlert, showToastOrAlert } from '../../helpers/Common';
import { formatDateTime } from '../security/securityShared';
import {
  SITE_CONDITIONS,
  PHOTO_KINDS,
  CONTINUATION_OWNERS,
  OUTCOMES_WITH_REMAINING_WORK,
  LIMITS,
  workStatusInfo,
  sortVisits,
  findEditableVisit,
  canStartVisit,
  arrivedAt,
  visitPhotos,
  visitStatus,
  latestChangeRequest,
  emptyForm,
  formFromVisit,
  formFromDraft,
  requiresDescription,
  validateForm,
  buildPayload,
  flattenServerErrors,
  draftKey,
  preparePhoto,
} from './fieldServiceShared';
import {
  useFieldServiceStyles,
  Section,
  InfoRow,
  Badge,
  FieldLabel,
  FieldError,
  ChipGroup,
  OutlineButton,
  PhotoGrid,
  VisitCard,
  toneColor,
} from './fieldServiceUi';

const WORK_STATUS_HINTS = {
  awaiting_visit: 'Tap "Start" when you arrive at the site. Your arrival time is recorded by the server.',
  in_progress: 'Fill in the report and tap "Finish and submit report" before leaving the site.',
  awaiting_approval: 'Your report was sent and is waiting for the organization to review it.',
  changes_requested: 'The organization asked for changes. Edit the report and submit it again.',
  follow_up_required: 'Work remains on this order. Start a new visit when you return to the site.',
  completed: 'The organization approved the work and the order is completed.',
};

// Fields the form shows errors for; any other server error is listed below the form.
const FORM_FIELDS = new Set([
  'site_condition',
  'problem_description',
  'actions',
  'has_remaining_work',
  'remaining_action',
  'continuation_owner',
  'continuation_note',
  'outcome',
]);
const isFormField = (key) => FORM_FIELDS.has(key) || /^actions\.\d+$/.test(key);

// Signed photo URLs live 15 minutes; refetch at most this often when one fails.
const PHOTO_REFRESH_INTERVAL = 2 * 60 * 1000;
const LOCATION_TIMEOUT = 10000;
const DRAFT_SAVE_DELAY = 400;

const omitKeys = (errors, field) => {
  const next = { ...errors };
  Object.keys(next).forEach((key) => {
    if (key === field || key.startsWith(`${field}.`)) delete next[key];
  });
  return next;
};

/** Current position, or null when unavailable. Never throws or hangs. */
const getCurrentCoords = async () => {
  let timer;
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const position = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise((resolve) => { timer = setTimeout(() => resolve(null), LOCATION_TIMEOUT); }),
    ]);
    const coords = position?.coords;
    return Number.isFinite(coords?.latitude) && Number.isFinite(coords?.longitude)
      ? { latitude: coords.latitude, longitude: coords.longitude }
      : null;
  } catch (error) {
    console.log('[FieldService] location unavailable:', error?.message);
    return null;
  } finally {
    clearTimeout(timer);
  }
};

const errorMessage = (result, t) => {
  if (result?.error_code === 'NETWORK_ERROR') return t('Server did not respond. Please check your internet connection.');
  if (result?.status === 403) return result?.message || t('You do not have access to the report of this order.');
  if (result?.status === 404) return result?.message || t('The order or visit was not found.');
  return result?.message || t('Something went wrong. Please try again.');
};

// Daily report of a field technician for an organization order
// (docs/Backend-Field-Service-Daily-Report.md): start the visit on arrival,
// add photos, then finish and submit the report for the organization's review.
export default function FieldServiceReportScreen({ route }) {
  const { orderId } = route?.params || {};
  const { t, i18n } = useTranslation();
  const { NewStyles } = useFieldServiceStyles();
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [startedVisitId, setStartedVisitId] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [clientErrors, setClientErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});

  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [photoKind, setPhotoKind] = useState('before');

  const requestIdRef = useRef(0);
  const lastLoadRef = useRef(0);
  const dirtyRef = useRef(false);
  const saveTimerRef = useRef(null);

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  const load = useCallback(async ({ pull = false } = {}) => {
    if (!orderId) {
      setLoading(false);
      setLoadError({ message: t('Order ID not found') });
      return;
    }
    const requestId = ++requestIdRef.current;
    if (pull) setRefreshing(true);
    const result = await fieldServiceAPI.getReport(orderId);
    // A newer request was started meanwhile; its response wins.
    if (requestId !== requestIdRef.current) return;

    lastLoadRef.current = Date.now();
    if (result.success && result.data && typeof result.data === 'object') {
      setReport(result.data);
      setLoadError(null);
    } else {
      setLoadError(result);
    }
    setLoading(false);
    setRefreshing(false);
  }, [orderId, t]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const refreshPhotoUrls = useCallback(() => {
    if (Date.now() - lastLoadRef.current > PHOTO_REFRESH_INTERVAL) load();
  }, [load]);

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------

  const visits = useMemo(() => sortVisits(report?.visits), [report]);

  const editableVisit = useMemo(() => {
    if (!report) return null;
    const preferred = startedVisitId !== null
      ? visits.find((visit) => String(visit.id) === String(startedVisitId))
      : null;
    const open = findEditableVisit(report, preferred ? [preferred, ...visits] : visits);
    if (open) return open;
    // Just started but not listed yet: the start response's visit_id is enough
    // to fill the report in.
    if (startedVisitId !== null && !preferred && report.work_status === 'in_progress') {
      return { id: startedVisitId, status: 'in_progress', photos: [] };
    }
    return null;
  }, [report, visits, startedVisitId]);

  // Ids are compared as strings: the start response and the list may differ in type.
  const editableVisitId = editableVisit ? String(editableVisit.id) : null;
  const editableVisitRef = useRef(editableVisit);
  editableVisitRef.current = editableVisit;

  const pastVisits = useMemo(
    () => visits.filter((visit) => String(visit.id) !== editableVisitId),
    [visits, editableVisitId]
  );

  const canStart = report ? canStartVisit(report, visits) && !editableVisit : false;
  const editablePhotos = visitPhotos(editableVisit);
  const changeRequest = latestChangeRequest(editableVisit);
  const isResubmission = visitStatus(editableVisit) === 'changes_requested';
  const busy = submitting || starting;

  // ---------------------------------------------------------------------------
  // Form state per visit (pre-filled from the visit, then from a local draft)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    dirtyRef.current = false;
    clearTimeout(saveTimerRef.current);
    setClientErrors({});
    setServerErrors({});

    if (editableVisitId === null) {
      setForm(emptyForm());
      return undefined;
    }
    setForm(formFromVisit(editableVisitRef.current));

    let cancelled = false;
    AsyncStorage.getItem(draftKey(orderId, editableVisitId))
      .then((raw) => {
        if (cancelled || dirtyRef.current || !raw) return;
        let draft = null;
        try {
          draft = formFromDraft(JSON.parse(raw));
        } catch {
          draft = null;
        }
        if (draft) setForm(draft);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [editableVisitId, orderId]);

  // Keeps what was typed if the app is closed before the report is submitted.
  useEffect(() => {
    if (!dirtyRef.current || editableVisitId === null) return undefined;
    const key = draftKey(orderId, editableVisitId);
    saveTimerRef.current = setTimeout(() => {
      AsyncStorage.setItem(key, JSON.stringify(form)).catch(() => {});
    }, DRAFT_SAVE_DELAY);
    return () => clearTimeout(saveTimerRef.current);
  }, [form, editableVisitId, orderId]);

  const clearErrors = (field) => {
    setClientErrors((prev) => omitKeys(prev, field));
    setServerErrors((prev) => omitKeys(prev, field));
  };

  const updateForm = (patch) => {
    dirtyRef.current = true;
    setForm((prev) => ({ ...prev, ...patch }));
    Object.keys(patch).forEach(clearErrors);
  };

  const updateActions = (change) => {
    dirtyRef.current = true;
    setForm((prev) => ({ ...prev, actions: change(prev.actions) }));
    clearErrors('actions');
  };

  const setAction = (index, text) => updateActions((actions) => actions.map((a, i) => (i === index ? text : a)));
  const addAction = () => updateActions((actions) => (actions.length < LIMITS.MAX_ACTIONS ? [...actions, ''] : actions));
  const removeAction = (index) => updateActions((actions) => {
    const next = actions.filter((_, i) => i !== index);
    return next.length > 0 ? next : [''];
  });

  const fieldError = (field) => clientErrors[field] || serverErrors[field];
  const otherServerErrors = Object.entries(serverErrors).filter(([key]) => !isFormField(key));

  // ---------------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------------

  const startVisit = async () => {
    setStarting(true);
    const coords = await getCurrentCoords();
    const result = await fieldServiceAPI.startVisit(orderId, coords);
    if (result.success) {
      const visitId = result.data?.visit_id ?? result.data?.visit?.id ?? null;
      if (visitId !== null) setStartedVisitId(visitId);
      showToastOrAlert(t('Visit started. Your arrival time was recorded.'));
      await load();
    } else {
      showAlert(t('Error'), errorMessage(result, t), [], t);
      if (result.status === 409) await load();
    }
    setStarting(false);
  };

  const confirmStart = () => {
    showAlert(
      t('Start visit'),
      t('Your arrival at the site will be recorded now. Continue?'),
      [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Start'), style: 'default', onPress: startVisit },
      ],
      t
    );
  };

  // ---------------------------------------------------------------------------
  // Photos
  // ---------------------------------------------------------------------------

  const uploadPhoto = async (photo) => {
    setUploading(true);
    const result = await fieldServiceAPI.uploadPhoto(orderId, editableVisitId, photo, photoKind);
    if (result.success) {
      showToastOrAlert(t('Photo uploaded.'));
      await load();
    } else {
      const message = result.status === 422 && result.errors
        ? Object.values(flattenServerErrors(result.errors)).join('\n')
        : errorMessage(result, t);
      showAlert(t('Error'), message, [], t);
      if (result.status === 409) await load();
    }
    setUploading(false);
  };

  const pickPhoto = async (source) => {
    if (editablePhotos.length >= LIMITS.MAX_PHOTOS) {
      showAlert(t('Error'), t('At most {{n}} photos can be added to a visit.', { n: LIMITS.MAX_PHOTOS }), [], t);
      return;
    }
    try {
      let result;
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          showAlert(t('Error'), t('Camera access is required'), [], t);
          return;
        }
        result = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 0.7 });
      } else {
        if (Platform.OS !== 'web') {
          const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permission.granted) {
            showAlert(t('Error'), t('Gallery access is required'), [], t);
            return;
          }
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'images',
          quality: 0.7,
          allowsMultipleSelection: false,
        });
      }
      if (result.canceled || !result.assets?.length) return;

      const { photo, error } = preparePhoto(result.assets[0], t);
      if (error) {
        showAlert(t('Error'), error, [], t);
        return;
      }
      await uploadPhoto(photo);
    } catch (error) {
      console.log('[FieldService] photo picker error:', error?.message);
      showAlert(t('Error'), t('Error selecting image'), [], t);
    }
  };

  const deletePhoto = async (photo) => {
    setDeletingId(photo.id);
    const result = await fieldServiceAPI.deletePhoto(orderId, editableVisitId, photo.id);
    if (result.success) {
      showToastOrAlert(t('Photo deleted.'));
      await load();
    } else {
      showAlert(t('Error'), errorMessage(result, t), [], t);
      if (result.status === 409 || result.status === 404) await load();
    }
    setDeletingId(null);
  };

  const confirmDeletePhoto = (photo) => {
    showAlert(
      t('Delete photo'),
      t('Do you want to delete this photo?'),
      [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Delete'), style: 'destructive', onPress: () => deletePhoto(photo) },
      ],
      t
    );
  };

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const submitReport = async () => {
    const visitId = editableVisitId;
    const payload = buildPayload(form);
    // Server errors like `actions.2` index the non-empty actions that were sent.
    const sentActionIndexes = form.actions
      .map((action, index) => (action.trim() ? index : -1))
      .filter((index) => index >= 0);

    setSubmitting(true);
    const result = await fieldServiceAPI.submitVisit(orderId, visitId, payload);
    if (result.success) {
      dirtyRef.current = false;
      clearTimeout(saveTimerRef.current);
      await AsyncStorage.removeItem(draftKey(orderId, visitId)).catch(() => {});
      setServerErrors({});
      setStartedVisitId(null);
      showToastOrAlert(t('The report was submitted for the organization to review.'));
      await load();
    } else if (result.status === 422) {
      const errors = {};
      Object.entries(flattenServerErrors(result.errors)).forEach(([key, message]) => {
        const match = /^actions\.(\d+)$/.exec(key);
        const formIndex = match ? sentActionIndexes[Number(match[1])] : undefined;
        errors[match && formIndex !== undefined ? `actions.${formIndex}` : key] = message;
      });
      setServerErrors(errors);
      showAlert(t('Error'), result.message || t('Please correct the highlighted fields.'), [], t);
    } else {
      showAlert(t('Error'), errorMessage(result, t), [], t);
      if (result.status === 409) await load();
    }
    setSubmitting(false);
  };

  const confirmSubmit = () => {
    const errors = validateForm(form, t);
    setClientErrors(errors);
    if (Object.keys(errors).length > 0) {
      showToastOrAlert(t('Please complete the required fields.'));
      return;
    }
    showAlert(
      t('Finish and submit report'),
      isResubmission
        ? t('The corrected report will be sent to the organization for review again. Continue?')
        : t('Your departure time will be recorded and the report sent to the organization for review. You cannot edit it afterwards unless the organization asks for changes. Continue?'),
      [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Submit'), style: 'default', onPress: submitReport },
      ],
      t
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const renderInfo = () => {
    const order = report?.order ?? {};
    const organization = report?.organization ?? {};
    const location = report?.location ?? {};
    const status = workStatusInfo(report?.work_status);
    const addressLine = [location.city, location.address].filter(Boolean).join(i18n.language === 'fa' ? '، ' : ', ');

    return (
      <>
        {status && (
          <View style={[styles.statusBar, { borderColor: toneColor(status.tone) }]}>
            <View style={[NewStyles.row, styles.statusRow]}>
              <Ionicons name={status.icon} size={22} color={toneColor(status.tone)} />
              <Text style={[NewStyles.title10, styles.statusTitle, { color: toneColor(status.tone) }]}>
                {t(status.label)}
              </Text>
            </View>
            {!!WORK_STATUS_HINTS[report.work_status] && (
              <Text style={[NewStyles.text10, styles.statusHint]}>{t(WORK_STATUS_HINTS[report.work_status])}</Text>
            )}
          </View>
        )}

        <Section title={t('Order and organization')} icon="business-outline">
          {!!(organization.name || organization.title) && (
            <InfoRow label={t('Organization')} value={organization.name || organization.title} />
          )}
          <InfoRow label={t('Order number')} value={String(order.id ?? orderId)} />
          {!!(order.category?.name || order.category_name) && (
            <InfoRow label={t('Service')} value={order.category?.name || order.category_name} />
          )}
          {!!(order.des || order.description) && (
            <InfoRow label={t('Description')} value={order.des || order.description} />
          )}
        </Section>

        <Section title={t('Location')} icon="location-outline">
          {!!addressLine && <InfoRow label={t('Address')} value={addressLine} />}
          {!!location.number && <InfoRow label={t('Building number')} value={String(location.number)} />}
          {!!location.unit && <InfoRow label={t('Unit')} value={String(location.unit)} />}
          {!!location.floor && <InfoRow label={t('Floor')} value={String(location.floor)} />}
          {!!location.room && <InfoRow label={t('Room')} value={String(location.room)} />}
        </Section>
      </>
    );
  };

  const renderStart = () => (
    <Section title={t('New visit')} icon="walk-outline">
      <Text style={[NewStyles.text10, styles.paragraph]}>
        {visits.length > 0
          ? t('Start a new visit when you arrive at the site to continue the remaining work.')
          : t('Start the visit when you arrive at the site. Your arrival time is recorded by the server.')}
      </Text>
      <Button title={t('Start')} onPress={confirmStart} loading={starting} disabled={starting} />
    </Section>
  );

  const renderForm = () => (
    <Section
      title={t('Visit report')}
      icon="clipboard-outline"
      right={<Badge text={t(isResubmission ? 'Changes requested' : 'In progress')} tone={isResubmission ? 'danger' : 'active'} />}
    >
      {!!arrivedAt(editableVisit) && (
        <InfoRow label={t('Arrival')} value={formatDateTime(arrivedAt(editableVisit), t, i18n.language)} />
      )}

      {isResubmission && (
        <View style={styles.changeRequest}>
          <View style={[NewStyles.row, styles.statusRow]}>
            <Ionicons name="alert-circle-outline" size={20} color={themeColor6.bgColor(1)} />
            <Text style={[NewStyles.title10, styles.changeRequestTitle]}>{t('Organization asked for changes')}</Text>
          </View>
          {!!changeRequest?.note && <Text style={[NewStyles.text10, styles.paragraph]}>{changeRequest.note}</Text>}
        </View>
      )}

      {/* Site condition */}
      <FieldLabel text={t('Site condition')} required />
      <ChipGroup
        testID="site-condition"
        options={SITE_CONDITIONS}
        value={form.site_condition}
        onChange={(value) => updateForm({ site_condition: value })}
        disabled={busy}
      />
      <FieldError text={fieldError('site_condition')} />

      <FieldLabel text={t('Problem description')} required={requiresDescription(form)} />
      <TextInput
        style={[NewStyles.text10, styles.input, styles.multiline, fieldError('problem_description') && styles.inputError]}
        value={form.problem_description}
        onChangeText={(text) => updateForm({ problem_description: text })}
        placeholder={t('Example: The device battery was faulty')}
        placeholderTextColor={themeColor3.bgColor(1)}
        multiline
        textAlignVertical="top"
        maxLength={LIMITS.TEXT_MAX_LENGTH}
        editable={!busy}
      />
      <FieldError text={fieldError('problem_description')} />

      {/* Actions */}
      <FieldLabel text={t('Actions taken')} required />
      {form.actions.map((action, index) => (
        <View key={index}>
          <View style={[NewStyles.row, styles.actionRow]}>
            <Text style={[NewStyles.text10, styles.actionIndex]}>{index + 1}.</Text>
            <TextInput
              style={[NewStyles.text10, styles.input, styles.actionInput, fieldError(`actions.${index}`) && styles.inputError]}
              value={action}
              onChangeText={(text) => setAction(index, text)}
              placeholder={t('Example: Connections were checked')}
              placeholderTextColor={themeColor3.bgColor(1)}
              maxLength={LIMITS.ACTION_MAX_LENGTH}
              editable={!busy}
            />
            {form.actions.length > 1 && (
              <TouchableOpacity
                style={[styles.removeAction, NewStyles.center]}
                onPress={() => removeAction(index)}
                disabled={busy}
                accessibilityLabel={t('Remove action')}
              >
                <Ionicons name="close-circle" size={24} color={themeColor6.bgColor(0.8)} />
              </TouchableOpacity>
            )}
          </View>
          <FieldError text={fieldError(`actions.${index}`)} />
        </View>
      ))}
      <FieldError text={fieldError('actions')} />
      {form.actions.length < LIMITS.MAX_ACTIONS && (
        <OutlineButton
          testID="add-action"
          title={t('Add action')}
          icon="add-outline"
          onPress={addAction}
          disabled={busy}
          style={styles.addAction}
        />
      )}

      {/* Remaining work */}
      <FieldLabel text={t('Is there remaining work?')} required />
      <ChipGroup
        testID="remaining-work"
        options={[{ value: false, label: 'No, the work is done' }, { value: true, label: 'Yes, work remains' }]}
        value={form.has_remaining_work}
        onChange={(value) => updateForm({ has_remaining_work: value })}
        disabled={busy}
      />
      <FieldError text={fieldError('has_remaining_work')} />

      {form.has_remaining_work ? (
        <>
          <FieldLabel text={t('Remaining action')} required />
          <TextInput
            style={[NewStyles.text10, styles.input, fieldError('remaining_action') && styles.inputError]}
            value={form.remaining_action}
            onChangeText={(text) => updateForm({ remaining_action: text })}
            placeholder={t('Example: Final test under load')}
            placeholderTextColor={themeColor3.bgColor(1)}
            maxLength={LIMITS.TEXT_MAX_LENGTH}
            editable={!busy}
          />
          <FieldError text={fieldError('remaining_action')} />

          <FieldLabel text={t('Who continues the work?')} required />
          <ChipGroup
            testID="continuation-owner"
            options={CONTINUATION_OWNERS}
            value={form.continuation_owner}
            onChange={(value) => updateForm({ continuation_owner: value })}
            disabled={busy}
          />
          <FieldError text={fieldError('continuation_owner')} />

          <FieldLabel text={t('Note for continuing')} />
          <TextInput
            style={[NewStyles.text10, styles.input, styles.multiline, fieldError('continuation_note') && styles.inputError]}
            value={form.continuation_note}
            onChangeText={(text) => updateForm({ continuation_note: text })}
            placeholder={t('Example: Check the output cable after the part arrives')}
            placeholderTextColor={themeColor3.bgColor(1)}
            multiline
            textAlignVertical="top"
            maxLength={LIMITS.TEXT_MAX_LENGTH}
            editable={!busy}
          />
          <FieldError text={fieldError('continuation_note')} />

          <FieldLabel text={t('Visit outcome')} required />
          <ChipGroup
            testID="outcome"
            options={OUTCOMES_WITH_REMAINING_WORK}
            value={form.outcome}
            onChange={(value) => updateForm({ outcome: value })}
            disabled={busy}
          />
          <FieldError text={fieldError('outcome')} />
        </>
      ) : (
        <>
          <View style={[NewStyles.row, styles.completedNote]}>
            <Ionicons name="checkmark-circle-outline" size={18} color={toneColor('success')} />
            <Text style={[NewStyles.text10, styles.completedText]}>
              {t('Visit outcome: work completed')}
            </Text>
          </View>
          <FieldError text={fieldError('outcome')} />
        </>
      )}

      {/* Photos */}
      <FieldLabel text={t('Photos (optional)')} />
      <Text style={[NewStyles.text10, styles.help]}>
        {t('JPEG, PNG or WebP up to 5 MB. {{count}} of {{max}} photos added.', {
          count: editablePhotos.length,
          max: LIMITS.MAX_PHOTOS,
        })}
      </Text>
      <PhotoGrid
        photos={editablePhotos}
        onDelete={confirmDeletePhoto}
        deletingId={deletingId}
        onExpired={refreshPhotoUrls}
      />
      {editablePhotos.length < LIMITS.MAX_PHOTOS && (
        <>
          <Text style={[NewStyles.text10, styles.help, styles.kindLabel]}>{t('Photo type')}</Text>
          <ChipGroup
            testID="photo-kind"
            options={PHOTO_KINDS}
            value={photoKind}
            onChange={setPhotoKind}
            disabled={uploading || busy}
          />
          <View style={[NewStyles.row, styles.photoButtons]}>
            <OutlineButton
              testID="photo-camera"
              title={t('Camera')}
              icon="camera-outline"
              onPress={() => pickPhoto('camera')}
              loading={uploading}
              disabled={busy || deletingId !== null}
              style={styles.photoButton}
            />
            <OutlineButton
              testID="photo-gallery"
              title={t('Gallery')}
              icon="images-outline"
              onPress={() => pickPhoto('gallery')}
              loading={uploading}
              disabled={busy || deletingId !== null}
              style={styles.photoButton}
            />
          </View>
        </>
      )}

      {otherServerErrors.length > 0 && (
        <View style={styles.otherErrors}>
          {otherServerErrors.map(([key, message]) => (
            <FieldError key={key} text={message} />
          ))}
        </View>
      )}

      <Button
        title={t(isResubmission ? 'Submit corrected report' : 'Finish and submit report')}
        onPress={confirmSubmit}
        loading={submitting}
        disabled={busy || uploading || deletingId !== null}
        style={styles.submit}
      />
    </Section>
  );

  const renderBody = () => {
    if (loading) {
      return (
        <View style={[styles.state, NewStyles.center]}>
          <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
        </View>
      );
    }
    if (!report) {
      return (
        <View style={[styles.state, NewStyles.center]}>
          <Ionicons name="cloud-offline-outline" size={40} color={themeColor3.bgColor(1)} />
          <Text style={[NewStyles.text10, styles.stateText]}>{errorMessage(loadError, t)}</Text>
          <TouchableOpacity style={styles.retry} onPress={() => { setLoading(true); load(); }}>
            <Text style={NewStyles.title4}>{t('Try again')}</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <>
        {renderInfo()}
        {editableVisit && renderForm()}
        {canStart && renderStart()}

        {pastVisits.length > 0 && (
          <Text style={[NewStyles.title10, styles.historyTitle]}>{t('Visit history')}</Text>
        )}
        {pastVisits.map((visit) => (
          <VisitCard
            key={String(visit.id)}
            visit={visit}
            number={visits.length - visits.indexOf(visit)}
            onPhotoExpired={refreshPhotoUrls}
          />
        ))}
      </>
    );
  };

  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
      <CustomStatusBar />
      <ScreenHeaders title={t('Field service daily report')} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load({ pull: true })} />}
        >
          {renderBody()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 130,
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
  statusBar: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: themeColor4.bgColor(1),
  },
  statusRow: {
    gap: 8,
  },
  statusTitle: {
    flex: 1,
    fontSize: 15,
  },
  statusHint: {
    fontSize: 12,
    lineHeight: 22,
    marginTop: 6,
    color: themeColor10.bgColor(0.7),
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 22,
  },
  changeRequest: {
    marginTop: 10,
    padding: 10,
    gap: 6,
    borderRadius: 10,
    backgroundColor: themeColor6.bgColor(0.08),
  },
  changeRequestTitle: {
    flex: 1,
    fontSize: 14,
    color: themeColor6.bgColor(1),
  },
  input: {
    width: '100%',
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: themeColor3.bgColor(0.5),
    backgroundColor: themeColor4.bgColor(1),
  },
  multiline: {
    minHeight: 90,
  },
  inputError: {
    borderColor: themeColor6.bgColor(1),
  },
  actionRow: {
    gap: 6,
    marginBottom: 8,
  },
  actionIndex: {
    width: 22,
    fontSize: 13,
    textAlign: 'center',
    color: themeColor10.bgColor(0.55),
  },
  actionInput: {
    flex: 1,
    width: undefined,
  },
  removeAction: {
    width: 32,
    height: 32,
  },
  addAction: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  completedNote: {
    gap: 6,
    marginTop: 10,
  },
  completedText: {
    flex: 1,
    fontSize: 13,
  },
  help: {
    fontSize: 12,
    color: themeColor10.bgColor(0.6),
    marginBottom: 6,
  },
  kindLabel: {
    marginTop: 10,
  },
  photoButtons: {
    gap: 10,
    marginTop: 10,
  },
  photoButton: {
    flex: 1,
  },
  otherErrors: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: themeColor11.bgColor(0.08),
  },
  submit: {
    marginTop: 20,
  },
  historyTitle: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 10,
  },
});
