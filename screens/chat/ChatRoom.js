import { View, TextInput, Pressable, ImageBackground, Platform, KeyboardAvoidingView, Text, ActivityIndicator } from 'react-native'
import React, { useCallback, useEffect, useState,useMemo } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { showToastOrAlert } from '../../helpers/Common';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor10, themeColor3, themeColor4, themeColor5, themeColor6 } from '../../theme/Color';
import MessagesList from './MessagesList';
import { getTechnicianChatMessages, sendTechnicianMessage, markTechnicianMessagesAsRead } from '../../services/Api';
import { createStyles } from '../../styles/NewStyles';
export default function ChatRoom({ route }) {

   const { t, i18n } = useTranslation();
   const NewStyles = useMemo(
     () => createStyles(i18n.language),
     [i18n.language]
   );
    //  const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
    const userId = route?.params?.userId;
    const userName = route?.params?.userName;
    const [message, setMessage] = useState('');
    const token = useSelector((state) => state?.auth?.token);
    const [refreshing, setRefreshing] = useState(true)
    const [loading, setLoading] = useState(false)

    const [data, setData] = useState([]);
    const [isChatOpen, setIsChatOpen] = useState(true);

    const fetchData = async () => {
        try {
            console.log(`📨 بارگذاری پیام‌های چت با کاربر ${userId}`);

            // دریافت پیام‌ها
            const response = await getTechnicianChatMessages(userId);

            // بررسی ساختار response
            if (response?.success) {
                setData(response?.data?.messages || []);
                setIsChatOpen(response?.data?.is_chat_open);
            } else {
                setData([]);
                showToastOrAlert(response?.data?.message || t('Error fetching messages'));
            }

            // علامت‌گذاری به عنوان خوانده شده
            await markTechnicianMessagesAsRead(userId);
        } catch (error) {
            const message = error?.response ? t('An unexpected error occurred!') : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchData();

            // رفرش خودکار هر 5 ثانیه
            const interval = setInterval(fetchData, 5000);
            return () => clearInterval(interval);
        }
    }, [userId]);

    const send = async () => {
        if (!message?.trim()) return;

        setLoading(true);
        const messageText = message.trim();

        try {
            const response = await sendTechnicianMessage(userId, messageText);

            if (response?.success) {
                console.log('✅ پیام ارسال شد');
                setMessage('');
                fetchData();
            } else if (response?.error_code === 'CHAT_CLOSED') {
                showToastOrAlert(response.message || t('Chat is closed. There is no active order.'));
                setIsChatOpen(false);
            } else {
                showToastOrAlert(response?.message || t('Error sending message'));
            }
        } catch (error) {
            // بررسی خطای 403 - چت بسته شده
            if (error?.response?.status === 403) {
                const message = error?.response?.data?.message || t('Chat is closed. There is no active order.');
                showToastOrAlert(message);
                setIsChatOpen(false);
            } else {
                const message = error?.response ? t('An unexpected error occurred!') : t('Network error!');
                showToastOrAlert(message);
            }
        } finally {
            setLoading(false)
        }
    }

    // بررسی وضعیت بسته بودن چت
    const isClosed = !isChatOpen || data?.[0]?.is_closed == 1;
    // const insets = useSafeAreaInsets();

    return (
        <View style={[NewStyles.container, {
            // marginTop: insets.top,
            // marginBottom: insets.bottom * 3,
        }]}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} keyboardVerticalOffset={Platform.OS == 'ios' ? 90 : undefined} style={{ flex: 1 }} >
                {/* <ImageBackground source={require('../../assets/images/card/1.avif')} resizeMode='cover' blurRadius={20} style={{ justifyContent: 'space-between', flex: 1, overflow: 'visible' }}> */}
                <MessagesList messeges={data} refreshing={refreshing} onRefresh={() => { fetchData() }} />
                {isChatOpen ?
                    <View style={NewStyles.shadow}>
                        <View style={[NewStyles.rowWrapper, { backgroundColor: themeColor3.bgColor(0.1), paddingRight: 10 }]}>
                            <View style={[NewStyles.rowWrapper, { paddingVertical: 5 }]}>
                                <Pressable style={[{ padding: 10, aspectRatio: 1, backgroundColor: themeColor0.bgColor(1), marginHorizontal: 2 }, NewStyles.center, NewStyles.border100]}
                                    disabled={loading}
                                    onPress={() => {
                                        if (message?.trim()) {
                                            send()
                                        }
                                    }}>
                                    {!loading && <Ionicons name="paper-plane-outline" size={20} color={themeColor5.bgColor(1)} />}
                                    {loading && <ActivityIndicator color={themeColor5.bgColor(1)} size={20} />}
                                </Pressable>
                            </View>
                            <TextInput style={[{ flex: 1, marginHorizontal: 10 }, NewStyles.text10]} placeholderTextColor={themeColor10.bgColor(1)} placeholder={t('Write your message')} value={message} maxLength={5000} onChangeText={(p) => { setMessage(p) }} multiline={true} />
                        </View>
                    </View>
                    :
                    <View style={NewStyles.shadow}>
                        <View style={[NewStyles.rowWrapper, { backgroundColor: themeColor3.bgColor(0.1), paddingRight: 10 }]}>
                            <View style={[NewStyles.rowWrapper, { paddingVertical: 5 }]}>
                                <View style={[{ padding: 10, aspectRatio: 1, backgroundColor: themeColor6.bgColor(1), marginHorizontal: 2 }, NewStyles.center, NewStyles.border100]}>
                                    <Ionicons name="close" size={20} color={themeColor4.bgColor(1)} />
                                </View>
                            </View>
                            <Text style={[{ flex: 1, marginHorizontal: 10 }, NewStyles.text10]}>{t('Cannot send messages.')}</Text>
                        </View>
                    </View>
                }
                {/* </ImageBackground> */}
            </KeyboardAvoidingView>
        </View>
    )
}
