import { FlatList, RefreshControl, StyleSheet, Platform } from 'react-native';
import MessegeItem from './MessegeItem';
import { themeColor1 } from '../../theme/Color';

export default function MessagesList({ messeges, onRefresh, refreshing }) {
    // در وب، data را معکوس می‌کنیم چون inverted=false است
    const displayMessages = Platform.OS === 'web' 
        ? [...messeges].reverse() 
        : messeges;

    return (
        <FlatList
            contentContainerStyle={styles.contentContainerStyle}
            showsVerticalScrollIndicator={false}
            inverted={Platform.OS !== 'web'}
            refreshControl={<RefreshControl colors={[themeColor1.bgColor(1)]} refreshing={refreshing} onRefresh={onRefresh} />}
            data={displayMessages}
            keyExtractor={(item) => item?.id?.toString()}
            renderItem={({ item }) => <MessegeItem messege={item} />}
        />
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingTop: 20,
        paddingBottom: 70
    }
})