import { FlatList, StyleSheet } from 'react-native';

import ExtraDetailItem from './ExtraDetailItem';

export default function ExtraDetails({ data, extraId }) {
    return (
        <FlatList
            contentContainerStyle={styles.contentContainerStyle}
            horizontal inverted showsHorizontalScrollIndicator={false}
            data={data}
            keyExtractor={(item) => item?.id?.toString()}
            renderItem={({ item, index }) => <ExtraDetailItem item={item} extraId={extraId} index={index}/>}
        />
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        gap: 10,
        paddingHorizontal: '5%'
    },
})