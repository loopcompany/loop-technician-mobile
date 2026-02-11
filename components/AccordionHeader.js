import { TouchableOpacity, Text, View } from 'react-native'
import React, { useMemo } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import NewStyles from '../styles/NewStyles'
import { themeColor0, themeColor4, themeColor6 } from '../theme/Color'
import { createStyles } from '../styles/NewStyles';
import { useTranslation } from 'react-i18next';
const AccordionHeader = ({
    title,
    isActive,
    isOpen,
    onPress,
    inactiveMessage,
    badgeCount
}) => {
      const { t, i18n } = useTranslation();
      const NewStyles = useMemo(
        () => createStyles(i18n.language),
        [i18n.language]
      );
    return (
        <TouchableOpacity
            style={[
                NewStyles.rowWrapper,
                NewStyles.center,
                {
                    paddingHorizontal: '5%',
                    paddingVertical: 10,
                    backgroundColor: isActive ? themeColor0.bgColor(1) : themeColor4.bgColor(0.5),
                    marginHorizontal: '5%',
                    marginBottom: 10,
                    gap: 10,
                    width:'90%',
                    maxWidth: 800,
                    alignSelf: 'center',    
                },
                NewStyles.border10
            ]}
            onPress={onPress}
        >
            {isActive && <Ionicons name="checkmark" size={20} color={themeColor4.bgColor(1)} />}
            <View style={[NewStyles.row,{ flex: 1,gap: 8 }]}>
                <Text style={[NewStyles.title4]}>{title}</Text>
                {badgeCount > 0 && (
                    <View style={{
                        backgroundColor: themeColor6.bgColor(1),
                        borderRadius: 10,
                        minWidth: 20,
                        height: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 5,
                    }}>
                        <Text style={[NewStyles.title4, { fontSize: 11 }]}>
                            {badgeCount > 99 ? '99+' : badgeCount}
                        </Text>
                    </View>
                )}
            </View>
            <Ionicons name={isOpen ? 'chevron-up-outline' : 'chevron-down-outline'} size={20} color={themeColor4.bgColor(1)} />
        </TouchableOpacity>
    )
}

export default AccordionHeader
