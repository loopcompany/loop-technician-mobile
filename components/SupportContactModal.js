import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { createStyles } from '../styles/NewStyles';
import { colors, themeColor0, themeColor7 } from '../theme/Color';
import { spacing } from '../theme/Spacing';
import { radius } from '../theme/Radius';

/**
 * Lets the technician pick how to reach support: a phone call or a written
 * message (ticket). Used by the financial report's settlement request and
 * wrong-amount report (edits list 1405/07/03, items 13 and 14).
 * A modal rather than Alert.alert: on web showAlert can only offer two choices.
 */
export default function SupportContactModal({ visible, title, message, onCall, onMessage, onClose }) {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(() => createStyles(i18n.language), [i18n.language]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, NewStyles.center]}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <Text style={[NewStyles.title10, styles.title]}>{title}</Text>
              {!!message && <Text style={[NewStyles.text10, styles.message]}>{message}</Text>}

              <Pressable
                testID="support-contact-call"
                accessibilityRole="button"
                style={({ pressed }) => [NewStyles.row, styles.option, { backgroundColor: themeColor0.bgColor(1) }, pressed && styles.pressed]}
                onPress={onCall}
              >
                <Ionicons name="call" size={20} color={colors.white.color} />
                <Text style={[NewStyles.title4, styles.optionText]}>{t('Call Support')}</Text>
              </Pressable>

              <Pressable
                testID="support-contact-message"
                accessibilityRole="button"
                style={({ pressed }) => [NewStyles.row, styles.option, { backgroundColor: themeColor7.bgColor(1) }, pressed && styles.pressed]}
                onPress={onMessage}
              >
                <Ionicons name="chatbubbles" size={20} color={colors.white.color} />
                <Text style={[NewStyles.title4, styles.optionText]}>{t('Send a message / ticket to support')}</Text>
              </Pressable>

              <Pressable accessibilityRole="button" style={styles.cancel} onPress={onClose} hitSlop={8}>
                <Text style={[NewStyles.text10, styles.cancelText]}>{t('Cancel')}</Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay.bgColor(0.45),
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface.bgColor(1),
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    color: colors.textSecondary.color,
  },
  option: {
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  optionText: {
    fontSize: 14,
  },
  pressed: {
    opacity: 0.85,
  },
  cancel: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
  },
  cancelText: {
    color: colors.textSecondary.color,
  },
});
