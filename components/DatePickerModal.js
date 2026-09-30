import { View, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';

import NewStyles from '../styles/NewStyles';
import { colors } from '../theme/Color';
import { spacing } from '../theme/Spacing';
import { radius } from '../theme/Radius';
import Button from './Button';
import CalendarPicker from './calendar/CalendarPicker';
import { GREGORIAN, JALAALI } from './calendar/calendarModel';

// The calendar is components/calendar/CalendarPicker (edits list 1405/07/03,
// item 22: tapping the year opens a scrollable grid of years). The modal's
// props and output are unchanged: Jalali 'jYYYY/jMM/jDD' (Latin digits) unless
// isGregorian is set, whatever the UI language is.
const DatePickerModal = React.memo(function DatePickerModal({
    datePickerModal,
    setDatePickerModal,
    birthDate,
    setBirthDate,
    isCurrentDate,
    minimumDate = null, // optional lower bound
    maximumDate = null, // optional upper bound — defaults to today
    isGregorian = false
}) {
    const { t } = useTranslation();

    const maxDate = useMemo(() => maximumDate || new Date(), [maximumDate]);

    const handleRequestClose = useCallback(() => {
        setDatePickerModal(false);
    }, [setDatePickerModal]);

    const handleSelect = useCallback((selectedDate) => {
        setBirthDate(selectedDate.slice(0, 10));
    }, [setBirthDate]);

    return (
        <Modal animationType='fade' transparent={true} visible={datePickerModal} onRequestClose={handleRequestClose}>
            <View style={[styles.wrapper, NewStyles.center]}>
                <View style={styles.modalView}>
                    <TouchableOpacity
                        accessibilityRole="button"
                        style={[styles.closeButton, NewStyles.border10, NewStyles.center]}
                        onPress={handleRequestClose}
                    >
                        <Ionicons name={'close'} size={20} color={colors.error.color} />
                    </TouchableOpacity>

                    {/* Mounted only while open, so every opening starts from the
                        current value (or isCurrentDate). */}
                    {datePickerModal ? (
                        <CalendarPicker
                            value={birthDate}
                            onSelect={handleSelect}
                            initialDate={isCurrentDate}
                            minimumDate={minimumDate}
                            maximumDate={maxDate}
                            calendar={isGregorian ? GREGORIAN : JALAALI}
                            style={styles.calendar}
                        />
                    ) : null}

                    <Button title={t("Confirm")} onPress={handleRequestClose} />
                </View>
            </View>
        </Modal>
    )
});

// Custom comparison function for React.memo
// Only re-render if these specific props change
function arePropsEqual(prevProps, nextProps) {
    return (
        prevProps.datePickerModal === nextProps.datePickerModal &&
        prevProps.birthDate === nextProps.birthDate &&
        prevProps.isCurrentDate === nextProps.isCurrentDate &&
        prevProps.minimumDate === nextProps.minimumDate &&
        prevProps.maximumDate === nextProps.maximumDate &&
        prevProps.isGregorian === nextProps.isGregorian
        // Intentionally exclude setDatePickerModal and setBirthDate from comparison
        // as they cause unnecessary re-renders when parent re-renders
    );
}

export default React.memo(DatePickerModal, arePropsEqual);

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: colors.overlay.bgColor(0.4),
    },
    modalView: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: colors.surface.bgColor(1),
        borderRadius: radius.md,
        padding: spacing.lg,
        alignItems: 'center',
    },
    closeButton: {
        height: 40,
        width: 40,
        backgroundColor: colors.error.bgColor(0.2),
        marginBottom: spacing.md,
        alignSelf: 'flex-end',
    },
    calendar: {
        marginBottom: spacing.lg,
    },
});
