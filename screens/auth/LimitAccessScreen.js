import { StyleSheet, Text, View } from 'react-native'
import React, { useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { createStyles } from '../../styles/NewStyles';
import { themeColor4, themeColor6 } from '../../theme/Color';
import { Ionicons } from '@expo/vector-icons';

const LimitAccessScreen = ({ route }) => {
    const params = route?.params;
    const { t, i18n } = useTranslation();
    const NewStyles = useMemo(
        () => createStyles(i18n.language),
        [i18n.language]
    );

    return (
        <SafeAreaView style={[NewStyles.container, NewStyles.center]}>
            <View style={[{ backgroundColor: themeColor4.bgColor(1), width: '80%' }, NewStyles.border10]}>
                <View style={[{ backgroundColor: themeColor6.bgColor(0.2), width: '100%', borderColor: themeColor6.bgColor(1), borderWidth: 1, padding: 15 }, NewStyles.border10, NewStyles.center]}>
                    <Ionicons
                        name={'close-circle'}
                        size={30}
                        color={themeColor6.bgColor(1)}
                    />
                    <Text style={NewStyles.title6}>{t("Your account has been blocked for the following reason")}:</Text>
                    <Text style={[NewStyles.text6, {textAlign:'center'}]}>{params?.message}</Text>
                    <View style={{marginVertical:10, height: StyleSheet.hairlineWidth, backgroundColor:themeColor6.bgColor(1), width:'100%'}} />
                    <Text style={[NewStyles.text6, {textAlign:'center'}]}>{t("To return to normal conditions, you must visit Loop in person within 24 hours.")}</Text>

                </View>
            </View>
        </SafeAreaView>
    )
}

export default LimitAccessScreen

const styles = StyleSheet.create({})