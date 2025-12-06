import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor3, themeColor7 } from '../../theme/Color';

export default function MessegeItem({ messege }) {

    // is_user: 0 = پیام از تکنسین، 1 = پیام از کاربر
    // برای تکنسین: پیام خودش (is_user=0) سمت راست، پیام کاربر (is_user=1) سمت چپ
    if (messege.is_user == 1) {
        // پیام از کاربر - سمت چپ
        return (
            <View style={{ width: '80%', marginLeft: 15, marginBottom: 5, }}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                    <View style={{ alignSelf: 'flex-end', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: themeColor0.bgColor(0.5) }}>
                        <Text style={NewStyles.text4} selectable={true}>{messege?.msg}</Text>
                    </View>
                </View>
            </View>)
    } else {
        // پیام از تکنسین (خودمان) - سمت راست
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <View style={{ width: '80%', marginRight: 15, marginBottom: 5, }}>
                    <View style={{ alignSelf: 'flex-end', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: themeColor3.bgColor(0.1) }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <Text style={NewStyles.text} selectable={true}>{messege?.msg}</Text>
                            {/* نمایش علامت تیک‌ها برای پیام‌های تکنسین */}
                            {messege.is_read == 1 ? (
                                // دو تیک آبی - خوانده شده
                                <Ionicons name="checkmark-done" size={16} color={themeColor7.bgColor(1)} />
                            ) : (
                                // یک تیک خاکستری - ارسال شده اما خوانده نشده
                                <Ionicons name="checkmark" size={16} color={themeColor3.bgColor(0.7)} />
                            )}
                        </View>
                    </View>
                </View>
            </View>
        )
    }
}