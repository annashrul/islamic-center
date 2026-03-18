import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

const PrayerTimeCard = ({ name, time, isNext, icon }) => {
  return (
    <View style={[styles.container, isNext && styles.activeContainer]}>
      <View style={styles.left}>
        <Ionicons
          name={isNext ? 'notifications' : 'notifications-outline'}
          size={18}
          color={isNext ? COLORS.white : COLORS.gray}
        />
        <Text style={[styles.name, isNext && styles.activeText]}>{name}</Text>
      </View>
      <Text style={[styles.time, isNext && styles.activeText]}>{time}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
  },
  activeContainer: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    marginHorizontal: 4,
    marginVertical: 2,
    borderBottomWidth: 0,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    marginLeft: 12,
    fontWeight: '500',
  },
  time: {
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  activeText: {
    color: COLORS.white,
  },
});

export default PrayerTimeCard;
