import { View, Text, FlatList, RefreshControl, Switch, StyleSheet, TextInput, BackHandler, ScrollView } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor4, themeColor5 } from '../../theme/Color';
import { addExtraServices, emptyExtraServices, fetchExtraServices, removeExtraServices, updateExtraServicePrice } from '../../slices/extraSlice';
import Button from '../../components/Button';
import { showToastOrAlert } from '../../helpers/Common';
import ExtraDetails from '../../components/ExtraDetails';
import { uri } from '../../services/URL';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeaders from '../../components/ScreenHeaders';
import { fetchOrderExtras } from '../../slices/orderExtrasSlice';

export default function ExtraServices({ route, navigation }) {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const categoryId = route?.params?.categoryId;
    const orderId = route?.params?.orderId;
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const token = useSelector((state) => state?.auth?.token);
    const extraServices = useSelector(state => state.extraServices);
    console.log('Extra Services:', JSON.stringify(extraServices?.items, null, 2));
    useEffect(() => {
        dispatch(fetchExtraServices({ categoryId, orderId, token }));
    }, []);

    const [activeIndex, setActiveIndex] = useState(null);

    const addOrderExtraServices = async () => {
        if (extraServices?.items?.findIndex(item => item?.price == 0) != -1) {
            showToastOrAlert('لطفا حداقل یک مورد انتخاب کنید');
            return;
        }
        setLoading(true);
        try {
            console.log('📤 ارسال خدمات اضافی:', {
                order_id: orderId,
                extras: extraServices?.items
            });
            
            const response = await axios.post(`${uri}/technician/submit-extra-services`, { 
                order_id: orderId, 
                extras: extraServices?.items 
            }, { 
                headers: { 
                    'Accept': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                } 
            });
            
            console.log('✅ پاسخ ثبت خدمات:', response.data);
            
            if (response.status == 200 || response.status == 201) {
                showToastOrAlert(response?.data?.message || 'خدمات با موفقیت ثبت شد');
                dispatch(emptyExtraServices());
                
                // رفرش داده‌های orderExtras
                await dispatch(fetchOrderExtras(orderId));
                
                navigation.goBack();
            }
        } catch (error) {
            console.log('❌ خطا در ثبت خدمات:', error?.response?.data || error.message);
            const message = error?.response ? (error?.response?.status ? error?.response?.data?.message : t('An unexpected error occurred!')) : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                dispatch(emptyExtraServices())
                navigation.goBack();
                return true;
            };
            const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => backHandler.remove();
        }, []),
    );

    return (
        <SafeAreaView edges={{top:'off', bottom:'additive'}} style={NewStyles.container}>
            <ScreenHeaders title={'قطعات و هزینه ها'} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding:10}} refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor5.bgColor(1)} refreshing={refreshing} onRefresh={() => { dispatch(fetchExtraServices({ categoryId, orderId })) }} />}>
                <FlatList
                    scrollEnabled={false}
                    data={extraServices?.data}
                    keyExtractor={(item) => item.id?.toString()}
                    contentContainerStyle={[{paddingHorizontal:10, backgroundColor:themeColor4.bgColor(1)}, NewStyles.border10]}
                    ListHeaderComponent={() =>
                        <View style={[NewStyles.seperator, { gap: 10, paddingTop: '5%' }]}>
                            <View style={NewStyles.rowWrapper}>
                                <View style={[NewStyles.row, { gap: 5 }]}>
                                    <Ionicons name='help-circle-outline' size={24} color={themeColor4.bgColor(1)} />
                                    <Text style={NewStyles.title}>قطعات / هزینه ها</Text>
                                </View>
                            </View>
                            <Text style={NewStyles.text3}>خدمات مازادی که می‌خواهید به سرویس خود اضافه کنید را در این قسمت می‌توانید انتخاب کنید.</Text>
                        </View>}
                    renderItem={({ item }) => {
                        const extraItem = extraServices?.items?.find(x => x?.id == item?.id);
                        return (
                            <View style={{ padding: '5%', gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(1) }}>
                                <View style={[NewStyles.rowWrapper, { gap: 5 }]}>
                                    <View style={{ gap: 10, flex: 1 }}>
                                        <Text style={NewStyles.text10}>{item?.title}</Text>
                                        <Text style={NewStyles.text3}>{item?.des}</Text>
                                    </View>
                                    <Switch
                                        trackColor={{ false: themeColor3.bgColor(0.5), true: themeColor1.bgColor(0.5) }}
                                        thumbColor={extraItem ? themeColor0.bgColor(1) : themeColor0.bgColor(1)}
                                        ios_backgroundColor={themeColor0.bgColor(0.5)}
                                        style={{ transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] }}
                                        value={extraItem ? true : false}
                                        onValueChange={() => {
                                            if (!extraItem) {
                                                dispatch(addExtraServices({ id: item.id, extra_detail_id: null, title: null, price: 0 }))
                                            } else {
                                                dispatch(removeExtraServices({ id: item?.id }));
                                            }
                                        }}
                                    />
                                </View>

                                {(item?.extra_service_details?.length > 0) ?
                                    extraItem && <ExtraDetails data={item?.extra_service_details} extraId={item?.id} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
                                    :
                                    extraItem &&
                                    <View style={[{ backgroundColor: themeColor3.bgColor(0.2), }, NewStyles.row, NewStyles.border10]}>
                                        <View
                                            style={[
                                                {
                                                    gap: 5, flex: 2, minHeight: 50,
                                                    paddingHorizontal: '5%',
                                                },
                                                NewStyles.row
                                            ]}
                                        >
                                            <Ionicons name={'cash-outline'} size={20} color={themeColor0.bgColor(1)} />
                                            <TextInput style={[styles.textInput, NewStyles.border10, NewStyles.text10]} keyboardType='number-pad' placeholder={'مبلغ توافق شده  را وارد کنید.'} placeholderTextColor={themeColor3.bgColor(1)} value={extraItem?.price ? extraItem?.price?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ''} onChangeText={(text) => { dispatch(updateExtraServicePrice({ id: item?.id, title: null, price: Number(text?.replace(/,/g, "")), extra_detail_id: null })) }} />
                                        </View>
                                        <View
                                            style={[
                                                { gap: 5, flex: 1, backgroundColor: themeColor3.bgColor(1), height: 50 },
                                                NewStyles.border10,
                                                NewStyles.center
                                            ]} >
                                            <Text style={NewStyles.text4}>تومان</Text>
                                        </View>
                                    </View>
                                }
                            </View>
                        )
                    }}
                />
            </ScrollView>
            <View style={[NewStyles.row,  NewStyles.shadow, {paddingHorizontal:'5%'}]}>
                <Button title={'ثبت'} loading={loading} onPress={() => { addOrderExtraServices() }} />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    textInput: {
        width: '100%',
        height: 50,
        backgroundColor: 'transparent',
    },
})