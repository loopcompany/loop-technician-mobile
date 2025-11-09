import { Text, Pressable, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor3, themeColor5 } from '../theme/Color';
import { formatPrice } from '../helpers/Common';
import { updateExtraServicePrice } from '../slices/extraSlice';

export default function ExtraDetailItem({ item, extraId, index }) {

    const dispatch = useDispatch();

    const extraServices = useSelector(state => state.extraServices?.items)?.find(x => (x?.id == extraId && x?.extra_detail_id == item?.id));
    let isActive = extraServices != undefined ? true : false;
    let color = isActive ? themeColor5.bgColor(1) : themeColor0.bgColor(1);
    let backgroundColor = isActive ? themeColor0.bgColor(1) : themeColor3.bgColor(0.2);

    return (
        <View>
            <Pressable 
                style={[
                    styles.filterItem, 
                    NewStyles.border10, 
                    { 
                        backgroundColor: backgroundColor, 
                        gap: 10 
                    }
                ]} 
                onPress={() => { 
                    dispatch(updateExtraServicePrice({ 
                        id: extraId, 
                        title: item?.title, 
                        price: Number(item?.price), 
                        extra_detail_id: item?.id 
                    })) 
                }}
            >
                {item?.title && <Text style={[NewStyles.text4, { color: color }]}>{item?.title}</Text>}
                <Text style={[NewStyles.text4, { color: color }]}>{formatPrice(item?.price)} تومان</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    filterItem: {
        paddingHorizontal: 15,
        padding: 10,
        gap: 5,
    },
})