// UI pieces of the field-service daily report screen.
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';

import { createStyles } from '../../styles/NewStyles';
import { themeColor0, themeColor3, themeColor4, themeColor6, themeColor7, themeColor10, themeColor11 } from '../../theme/Color';
import { InfoRow, formatDateTime } from '../security/securityShared';
import {
  SITE_CONDITIONS,
  CONTINUATION_OWNERS,
  OUTCOMES,
  PHOTO_KINDS,
  labelOf,
  visitStatusInfo,
  arrivedAt,
  leftAt,
  durationMinutes,
  formatDuration,
  visitActions,
  visitPhotos,
  visitReviews,
  reviewedAt,
  hasRemainingWork,
} from './fieldServiceShared';

export { InfoRow };

export const useFieldServiceStyles = () => {
  const { i18n } = useTranslation();
  const NewStyles = useMemo(() => createStyles(i18n.language), [i18n.language]);
  const styles = useMemo(() => createUiStyles(NewStyles), [NewStyles]);
  return { NewStyles, styles };
};

const TONES = {
  neutral: { background: themeColor3.bgColor(0.15), color: themeColor10.bgColor(0.65) },
  active: { background: themeColor0.bgColor(0.1), color: themeColor0.bgColor(1) },
  warning: { background: themeColor11.bgColor(0.12), color: themeColor11.bgColor(1) },
  danger: { background: themeColor6.bgColor(0.12), color: themeColor6.bgColor(1) },
  success: { background: themeColor7.bgColor(0.15), color: themeColor7.bgColor(1) },
};

export const toneColor = (tone) => (TONES[tone] ?? TONES.neutral).color;

export const Badge = ({ text, tone = 'neutral' }) => {
  const { NewStyles, styles } = useFieldServiceStyles();
  const colors = TONES[tone] ?? TONES.neutral;
  return (
    <View style={[styles.badge, { backgroundColor: colors.background }]}>
      <Text style={[NewStyles.text10, styles.badgeText, { color: colors.color }]}>{text}</Text>
    </View>
  );
};

/** A titled white card. */
export const Section = ({ title, icon, right, children, style }) => {
  const { NewStyles, styles } = useFieldServiceStyles();
  return (
    <View style={[styles.card, style]}>
      {(title || right) && (
        <View style={[NewStyles.row, styles.sectionHeader]}>
          {icon && <Ionicons name={icon} size={20} color={themeColor0.bgColor(1)} />}
          <Text style={[NewStyles.title10, styles.sectionTitle]}>{title}</Text>
          {right}
        </View>
      )}
      {children}
    </View>
  );
};

export const FieldLabel = ({ text, required }) => {
  const { NewStyles, styles } = useFieldServiceStyles();
  return (
    <Text style={[NewStyles.title10, styles.fieldLabel]}>
      {text}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
  );
};

export const FieldError = ({ text }) => {
  const { NewStyles, styles } = useFieldServiceStyles();
  if (!text) return null;
  return <Text style={[NewStyles.text6, styles.fieldError]}>{text}</Text>;
};

/** Single-choice chips. */
export const ChipGroup = ({ options, value, onChange, disabled, testID }) => {
  const { t } = useTranslation();
  const { NewStyles, styles } = useFieldServiceStyles();
  return (
    <View style={[NewStyles.row, styles.chips]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <TouchableOpacity
            key={String(option.value)}
            testID={testID ? `${testID}-${option.value}` : undefined}
            style={[styles.chip, selected && styles.chipSelected, disabled && styles.disabled]}
            onPress={() => onChange(option.value)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled: !!disabled }}
          >
            <Text style={[NewStyles.text10, styles.chipText, selected && styles.chipTextSelected]}>
              {t(option.label)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

/** Outlined button used for secondary actions (add action, pick photo…). */
export const OutlineButton = ({ title, icon, onPress, loading, disabled, tone = 'active', testID, style }) => {
  const { NewStyles, styles } = useFieldServiceStyles();
  const color = toneColor(tone);
  return (
    <TouchableOpacity
      testID={testID}
      style={[NewStyles.row, NewStyles.center, styles.outlineButton, { borderColor: color }, (disabled || loading) && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={color} />}
          <Text style={[NewStyles.title10, styles.outlineText, { color }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

/**
 * Photo thumbnails. Photo URLs are signed for 15 minutes; `onExpired` lets the
 * screen fetch the report again for fresh URLs when one fails to load.
 */
export const PhotoGrid = ({ photos, onDelete, deletingId, onExpired }) => {
  const { t } = useTranslation();
  const { NewStyles, styles } = useFieldServiceStyles();
  const [preview, setPreview] = useState(null);

  if (photos.length === 0) return null;

  return (
    <>
      <View style={[NewStyles.row, styles.photoGrid]}>
        {photos.map((photo) => (
          <View key={String(photo.id)} style={styles.photoItem}>
            <TouchableOpacity onPress={() => setPreview(photo)} activeOpacity={0.8}>
              <Image
                source={{ uri: photo.url }}
                style={styles.photo}
                contentFit="cover"
                cachePolicy="memory-disk"
                recyclingKey={String(photo.id)}
                onError={onExpired}
              />
            </TouchableOpacity>
            <Text style={[NewStyles.text10, styles.photoKind]} numberOfLines={1}>
              {t(labelOf(PHOTO_KINDS, photo.kind) ?? 'Other')}
            </Text>
            {onDelete && (
              <TouchableOpacity
                style={[styles.photoDelete, NewStyles.center]}
                onPress={() => onDelete(photo)}
                disabled={deletingId !== null && deletingId !== undefined}
                accessibilityLabel={t('Delete photo')}
              >
                {deletingId === photo.id ? (
                  <ActivityIndicator size="small" color={themeColor4.bgColor(1)} />
                ) : (
                  <Ionicons name="trash-outline" size={16} color={themeColor4.bgColor(1)} />
                )}
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      <Modal visible={preview !== null} transparent animationType="fade" onRequestClose={() => setPreview(null)}>
        <Pressable style={[styles.previewBackdrop, NewStyles.center]} onPress={() => setPreview(null)}>
          {preview && (
            <Image source={{ uri: preview.url }} style={styles.previewImage} contentFit="contain" onError={onExpired} />
          )}
          <View style={[styles.previewClose, NewStyles.center]}>
            <Ionicons name="close" size={26} color={themeColor4.bgColor(1)} />
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const BulletList = ({ items }) => {
  const { NewStyles, styles } = useFieldServiceStyles();
  return (
    <View style={styles.bullets}>
      {items.map((item, index) => (
        <View key={`${index}-${item}`} style={[NewStyles.row, styles.bulletRow]}>
          <Text style={[NewStyles.text10, styles.bulletIndex]}>{index + 1}.</Text>
          <Text style={[NewStyles.text10, styles.bulletText]}>{item}</Text>
        </View>
      ))}
    </View>
  );
};

/** A read-only past (or submitted) visit report. */
export const VisitCard = ({ visit, number, onPhotoExpired }) => {
  const { t, i18n } = useTranslation();
  const { NewStyles, styles } = useFieldServiceStyles();
  const status = visitStatusInfo(visit);
  const actions = visitActions(visit);
  const reviews = visitReviews(visit);
  const remaining = hasRemainingWork(visit);
  const left = leftAt(visit);

  return (
    <Section
      title={t('Visit {{n}}', { n: number })}
      icon="document-text-outline"
      right={<Badge text={t(status.label)} tone={status.tone} />}
    >
      <InfoRow label={t('Arrival')} value={formatDateTime(arrivedAt(visit), t, i18n.language)} />
      <InfoRow label={t('Departure')} value={left ? formatDateTime(left, t, i18n.language) : '—'} />
      <InfoRow label={t('Time on site')} value={formatDuration(durationMinutes(visit), t)} />
      <InfoRow label={t('Site condition')} value={t(labelOf(SITE_CONDITIONS, visit.site_condition) ?? '—')} />
      {!!visit.problem_description && <InfoRow label={t('Problem description')} value={visit.problem_description} />}
      <InfoRow label={t('Visit outcome')} value={t(labelOf(OUTCOMES, visit.outcome) ?? '—')} />

      {actions.length > 0 && (
        <>
          <Text style={[NewStyles.title10, styles.subTitle]}>{t('Actions taken')}</Text>
          <BulletList items={actions} />
        </>
      )}

      {remaining && (
        <View style={styles.remainingBox}>
          <Text style={[NewStyles.title10, styles.subTitle]}>{t('Remaining work')}</Text>
          <InfoRow label={t('Remaining action')} value={visit.remaining_action || '—'} />
          <InfoRow
            label={t('Continued by')}
            value={t(labelOf(CONTINUATION_OWNERS, visit.continuation_owner) ?? '—')}
          />
          {!!visit.continuation_note && <InfoRow label={t('Note for continuing')} value={visit.continuation_note} />}
        </View>
      )}

      {visitPhotos(visit).length > 0 && (
        <>
          <Text style={[NewStyles.title10, styles.subTitle]}>{t('Photos')}</Text>
          <PhotoGrid photos={visitPhotos(visit)} onExpired={onPhotoExpired} />
        </>
      )}

      {reviews.length > 0 && (
        <>
          <Text style={[NewStyles.title10, styles.subTitle]}>{t('Organization review')}</Text>
          {reviews.map((review, index) => (
            <ReviewItem key={String(review.id ?? index)} review={review} />
          ))}
        </>
      )}
    </Section>
  );
};

export const ReviewItem = ({ review }) => {
  const { t, i18n } = useTranslation();
  const { NewStyles, styles } = useFieldServiceStyles();
  const approved = review.decision === 'approve';
  return (
    <View style={[styles.review, { borderColor: toneColor(approved ? 'success' : 'danger') }]}>
      <View style={[NewStyles.rowWrapper, styles.reviewHeader]}>
        <Badge text={t(approved ? 'Approved' : 'Changes requested')} tone={approved ? 'success' : 'danger'} />
        <Text style={[NewStyles.text10, styles.reviewDate]}>{formatDateTime(reviewedAt(review), t, i18n.language)}</Text>
      </View>
      {!!review.note && <Text style={[NewStyles.text10, styles.reviewNote]}>{review.note}</Text>}
    </View>
  );
};

const createUiStyles = (NewStyles) => StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: themeColor3.bgColor(0.2),
  },
  sectionHeader: {
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
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
  fieldLabel: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 8,
  },
  required: {
    color: themeColor6.bgColor(1),
  },
  fieldError: {
    fontSize: 12,
    marginTop: 4,
  },
  chips: {
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: themeColor3.bgColor(0.5),
    backgroundColor: themeColor4.bgColor(1),
  },
  chipSelected: {
    borderColor: themeColor0.bgColor(1),
    backgroundColor: themeColor0.bgColor(1),
  },
  chipText: {
    fontSize: 13,
    textAlign: 'center',
  },
  chipTextSelected: {
    color: themeColor4.bgColor(1),
  },
  outlineButton: {
    height: 42,
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  outlineText: {
    fontSize: 14,
  },
  disabled: {
    opacity: 0.5,
  },
  photoGrid: {
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  photoItem: {
    width: 92,
  },
  photo: {
    width: 92,
    height: 92,
    borderRadius: 8,
    backgroundColor: themeColor3.bgColor(0.15),
  },
  photoKind: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  photoDelete: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: themeColor6.bgColor(0.85),
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  previewImage: {
    width: '100%',
    height: '80%',
  },
  previewClose: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  subTitle: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 6,
  },
  bullets: {
    gap: 4,
  },
  bulletRow: {
    gap: 6,
    alignItems: 'flex-start',
  },
  bulletIndex: {
    fontSize: 13,
    color: themeColor10.bgColor(0.55),
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 22,
  },
  remainingBox: {
    marginTop: 4,
  },
  review: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  reviewHeader: {
    gap: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: themeColor10.bgColor(0.55),
  },
  reviewNote: {
    fontSize: 13,
    lineHeight: 22,
    marginTop: 6,
  },
});
