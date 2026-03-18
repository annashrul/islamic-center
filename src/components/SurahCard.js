import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SIZES } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';

const SurahCard = ({ surah, onPress }) => {
  const { colors: COLORS } = useSettings();
  const styles = makeStyles(COLORS);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.numberContainer}>
        <View style={styles.numberDiamond}>
          <Text style={styles.number}>{surah.number}</Text>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{surah.name}</Text>
        <Text style={styles.meta}>
          {surah.type} - {surah.verses} Ayat
        </Text>
      </View>
      <View style={styles.arabicContainer}>
        <Text style={styles.arabic}>{surah.arabic}</Text>
      </View>
    </TouchableOpacity>
  );
};

const makeStyles = (C) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: C.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: C.divider,
  },
  numberContainer: {
    width: 45,
    alignItems: 'center',
  },
  numberDiamond: {
    width: 36,
    height: 36,
    backgroundColor: C.primary,
    transform: [{ rotate: '45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  number: {
    color: C.white,
    fontSize: SIZES.small,
    fontWeight: '700',
    transform: [{ rotate: '-45deg' }],
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: C.textPrimary,
  },
  meta: {
    fontSize: SIZES.small,
    color: C.textMuted,
    marginTop: 2,
  },
  arabicContainer: {
    marginLeft: 10,
  },
  arabic: {
    fontSize: SIZES.arabic,
    color: C.primary,
  },
});

export default SurahCard;
