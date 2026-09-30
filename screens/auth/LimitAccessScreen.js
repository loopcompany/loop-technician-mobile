import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React, { useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { createStyles } from '../../styles/NewStyles';
import { colors, themeColor0, themeColor4, themeColor6 } from '../../theme/Color';
import { spacing } from '../../theme/Spacing';
import { radius } from '../../theme/Radius';
import { callSupport } from '../../helpers/support';

// Shown when a technician's access is closed from the admin panel — at login
// (ACCOUNT_DISABLED) or while signed in (ACCESS_DENIED from validate-token).
// Layout per edits list 1405/07/03, item 5: red X, "restriction or deactivation
// page, for the following reasons", the reason set in the panel, and the
// in-person visit notice.
const LimitAccessScreen = ({ route, navigation }) => {
    const message = route?.params?.message;
    const { t, i18n } = useTranslation();
    const NewStyles = useMemo(
        () => createStyles(i18n.language),
        [i18n.language]
    );

    const backToLogin = () => {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    return (
        <SafeAreaView style={[NewStyles.container, styles.screen]}>
            <ScrollView contentContainerStyle={[styles.content, NewStyles.center]}>
                <View testID="limit-access-card" style={styles.card}>
                    <Ionicons name="close" size={64} color={themeColor6.bgColor(1)} style={styles.icon} />
                    <Text style={[NewStyles.title10, styles.title]}>
                        {t("Restriction or deactivation page, for the following reasons")}:
                    </Text>

                    {!!message && (
                        <View style={styles.reasonBox}>
                            <Text style={[NewStyles.title10, styles.reason]}>{message}</Text>
                        </View>
                    )}

                    <View style={styles.divider} />

                    <Text style={[NewStyles.title10, styles.notice]}>
                        {t("To return to normal conditions, you must visit Loop in person within 24 hours.")}
                    </Text>
                </View>

                <TouchableOpacity
                    style={[NewStyles.row, styles.button, { backgroundColor: themeColor0.bgColor(1) }]}
                    onPress={() => callSupport(t)}
                >
                    <Ionicons name="call" size={18} color={colors.white.color} />
                    <Text style={NewStyles.title4}>{t('Call Support')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    testID="limit-access-back"
                    style={[NewStyles.row, styles.button, styles.secondaryButton]}
                    onPress={backToLogin}
                >
                    <Ionicons name="log-in-outline" size={18} color={themeColor0.bgColor(1)} />
                    <Text style={[NewStyles.title, styles.secondaryText]}>{t('Back to login')}</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    )
}

export default LimitAccessScreen

const styles = StyleSheet.create({
    screen: {
        backgroundColor: colors.background.bgColor(1),
    },
    content: {
        flexGrow: 1,
        padding: spacing.lg,
        gap: spacing.md,
    },
    card: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: themeColor4.bgColor(1),
        borderRadius: 28,
        borderWidth: 1.5,
        borderColor: colors.textPrimary.bgColor(0.8),
        padding: spacing.lg,
        alignItems: 'center',
        gap: spacing.md,
    },
    icon: {
        fontWeight: 'bold',
    },
    title: {
        textAlign: 'center',
    },
    reasonBox: {
        width: '100%',
        backgroundColor: themeColor6.bgColor(0.08),
        borderColor: themeColor6.bgColor(0.5),
        borderWidth: 1,
        borderRadius: radius.md,
        padding: spacing.md,
    },
    reason: {
        textAlign: 'center',
        color: themeColor6.bgColor(1),
        fontSize: 15,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: themeColor6.bgColor(1),
        width: '100%',
    },
    notice: {
        textAlign: 'center',
        fontSize: 15,
    },
    button: {
        width: '100%',
        maxWidth: 420,
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: 12,
        borderRadius: radius.md,
    },
    secondaryButton: {
        backgroundColor: themeColor4.bgColor(1),
        borderWidth: 1,
        borderColor: themeColor0.bgColor(1),
    },
    secondaryText: {
        textAlign: 'center',
    },
})
