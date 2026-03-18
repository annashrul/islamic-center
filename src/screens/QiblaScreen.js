import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

const QiblaScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Arah Kiblat</Text>
        <Text style={styles.headerSubtitle}>Temukan arah kiblat dari lokasi Anda</Text>
      </View>

      <View style={styles.compassContainer}>
        <View style={styles.compassOuter}>
          <View style={styles.compassInner}>
            <Ionicons name="compass" size={120} color={COLORS.primary} />
            <View style={styles.kaabaIcon}>
              <Text style={styles.kaabaText}>Ka'bah</Text>
              <Ionicons name="navigate" size={24} color={COLORS.secondary} />
            </View>
          </View>
          <View style={styles.directionLabels}>
            <Text style={[styles.dirLabel, styles.north]}>U</Text>
            <Text style={[styles.dirLabel, styles.south]}>S</Text>
            <Text style={[styles.dirLabel, styles.east]}>T</Text>
            <Text style={[styles.dirLabel, styles.west]}>B</Text>
          </View>
        </View>

        <View style={styles.degreeContainer}>
          <Text style={styles.degreeValue}>295.5°</Text>
          <Text style={styles.degreeLabel}>Barat Laut</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="location" size={20} color={COLORS.primary} />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Lokasi Anda</Text>
          <Text style={styles.infoValue}>Jakarta, Indonesia</Text>
          <Text style={styles.infoCoords}>-6.2088° S, 106.8456° E</Text>
        </View>
      </View>

      <View style={styles.noteCard}>
        <Ionicons name="information-circle-outline" size={18} color={COLORS.gray} />
        <Text style={styles.noteText}>
          Untuk hasil yang akurat, pastikan perangkat Anda jauh dari benda logam
          dan kalibrasi kompas dengan menggerakkan perangkat membentuk angka 8.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 55,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: SIZES.font,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  compassContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  compassOuter: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  compassInner: {
    alignItems: 'center',
  },
  kaabaIcon: {
    alignItems: 'center',
    marginTop: 8,
  },
  kaabaText: {
    fontSize: SIZES.small,
    color: COLORS.secondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  directionLabels: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  dirLabel: {
    position: 'absolute',
    fontSize: SIZES.medium,
    fontWeight: '700',
    color: COLORS.primary,
  },
  north: {
    top: 12,
    alignSelf: 'center',
    left: '47%',
  },
  south: {
    bottom: 12,
    alignSelf: 'center',
    left: '47%',
  },
  east: {
    right: 16,
    top: '46%',
  },
  west: {
    left: 16,
    top: '46%',
  },
  degreeContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  degreeValue: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.primary,
  },
  degreeLabel: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginTop: 4,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoContent: {
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  infoValue: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginTop: 2,
  },
  infoCoords: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: 2,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
  },
  noteText: {
    flex: 1,
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginLeft: 10,
    lineHeight: 18,
  },
});

export default QiblaScreen;
