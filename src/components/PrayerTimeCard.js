import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';

const PrayerTimeCard = ({ name, time, isNext }) => {
  const { colors: COLORS } = useSettings();
  const styles = makeStyles(COLORS);

  return (
    <View style={[styles.container, isNext && styles.activeContainer]}>
      <View style={styles.left}>
        <Ionicons
          name={isNext ? 'notifications' : 'notifications-outline'}
          size={16}
          color={isNext ? COLORS.white : COLORS.textMuted}
        />
        <Text style={[styles.name, isNext && styles.activeText]}>{name}</Text>
      </View>
      <Text style={[styles.time, isNext && styles.activeText]}>{time}</Text>
    </View>
  );
};

const makeStyles = (C) => ({
  container: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: C.divider,
  },
  activeContainer: {
    backgroundColor: C.primary, borderRadius: SIZES.radiusSm, marginHorizontal: 4, marginVertical: 2, borderBottomWidth: 0,
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: SIZES.font, color: C.textSecondary, marginLeft: 10, fontWeight: '500' },
  time: { fontSize: SIZES.font, color: C.textSecondary, fontWeight: '600' },
  activeText: { color: C.white },
});

export default PrayerTimeCard;
