import { StyleSheet, Text, View } from 'react-native'
import React, { useMemo } from 'react'
import MapView, { Marker } from 'react-native-maps'
import { useTranslation } from 'react-i18next';
import { createStyles } from '../styles/NewStyles';
const ShowMapDetailComponent = ({ data }) => {
    const { t, i18n } = useTranslation();
    const NewStyles = useMemo(
        () => createStyles(i18n.language),
        [i18n.language]
    );
    const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
    return (
        <View>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: parseFloat(data?.user_address.latitude),
                    longitude: parseFloat(data?.user_address.longitude),
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                }}

            >
                <Marker
                    coordinate={{
                        latitude: parseFloat(data?.user_address.latitude),
                        longitude: parseFloat(data?.user_address.longitude),
                    }}
                    title={t("Order location")}
                    description={data?.user_address?.address}
                />
            </MapView>
        </View>
    )
}

export default ShowMapDetailComponent

const createLocalStyles = (NewStyles) => StyleSheet.create({})