import { View, Text } from 'react-native';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor3 } from '../../theme/Color';

export default function MessegeItem({ messege }) {

    // is_user: 0 = پیام از متخصص، 1 = پیام از کاربر
    // برای متخصص: پیام خودش (is_user=0) سمت راست، پیام کاربر (is_user=1) سمت چپ
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
        // پیام از متخصص (خودمان) - سمت راست
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <View style={{ width: '80%', marginRight: 15, marginBottom: 5, }}>
                    <View style={{ alignSelf: 'flex-end', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: themeColor3.bgColor(0.1) }}>
                        <Text style={NewStyles.text} selectable={true}>{messege?.msg}</Text>
                    </View>
                </View>
            </View>
        )
    }
}