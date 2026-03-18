import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';

const AyahCard = ({ ayah, surahNumber }) => {
  const { colors: COLORS } = useSettings();
  const styles = makeStyles(COLORS);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.ayahNumber}>
          <Text style={styles.ayahNumberText}>{ayah.numberInSurah}</Text>
        </View>
        <View style={styles.actions}>
          <Ionicons name="bookmark-outline" size={20} color={COLORS.primary} style={styles.actionIcon} />
          <Ionicons name="share-outline" size={20} color={COLORS.primary} style={styles.actionIcon} />
        </View>
      </View>
      <Text style={styles.arabicText}>{ayah.text}</Text>
      {ayah.translation && (
        <Text style={styles.translation}>{ayah.translation}</Text>
      )}
      {ayah.transliteration && (
        <Text style={styles.transliteration}>{ayah.transliteration}</Text>
      )}
    </View>
  );
};

const makeStyles = (C) => ({
  container: {
    backgroundColor: C.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: C.divider,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ayahNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ayahNumberText: {
    color: C.white,
    fontSize: SIZES.small,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
  },
  actionIcon: {
    marginLeft: 16,
  },
  arabicText: {
    fontSize: SIZES.arabicLarge,
    color: C.textPrimary,
    textAlign: 'right',
    lineHeight: 56,
    marginBottom: 12,
  },
  translation: {
    fontSize: SIZES.font,
    color: C.textMuted,
    lineHeight: 22,
    marginBottom: 6,
  },
  transliteration: {
    fontSize: SIZES.small,
    color: C.primary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});

export default AyahCard;
