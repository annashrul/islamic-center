import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

const PRAYER_SCHEDULE = [
  { name: 'Imsak', time: '04:25', icon: 'moon-outline' },
  { name: 'Subuh', time: '04:35', icon: 'sunny-outline' },
  { name: 'Terbit', time: '05:52', icon: 'sunny-outline' },
  { name: 'Dhuha', time: '06:15', icon: 'sunny' },
  { name: 'Dzuhur', time: '11:55', icon: 'sunny' },
  { name: 'Ashar', time: '15:13', icon: 'partly-sunny-outline' },
  { name: 'Maghrib', time: '17:55', icon: 'cloudy-night-outline' },
  { name: 'Isya', time: '19:08', icon: 'moon-outline' },
];

const PrayerTimesScreen = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentMin = hours * 60 + minutes;

      const prayerMinutes = PRAYER_SCHEDULE.map((p) => {
        const [h, m] = p.time.split(':').map(Number);
        return { name: p.name, total: h * 60 + m };
      });

      const next = prayerMinutes.find((p) => p.total > currentMin);
      if (next) {
        setNextPrayer(next.name);
        const diff = next.total - currentMin;
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        setCountdown(`${h} jam ${m} menit`);
      } else {
        setNextPrayer(prayerMinutes[0].name);
        setCountdown('Besok');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Waktu Sholat</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color={COLORS.secondary} />
          <Text style={styles.locationText}>Jakarta, Indonesia</Text>
        </View>

        <View style={styles.countdownCard}>
          <Text style={styles.countdownLabel}>Waktu menuju {nextPrayer}</Text>
          <Text style={styles.countdownTime}>{countdown}</Text>
          <Text style={styles.currentDate}>
            {currentTime.toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>
      </View>

      <View style={styles.prayerList}>
        {PRAYER_SCHEDULE.map((prayer) => (
          <View
            key={prayer.name}
            style={[
              styles.prayerItem,
              prayer.name === nextPrayer && styles.prayerItemActive,
            ]}
          >
            <View style={styles.prayerLeft}>
              <View
                style={[
                  styles.iconContainer,
                  prayer.name === nextPrayer && styles.iconContainerActive,
                ]}
              >
                <Ionicons
                  name={prayer.icon}
                  size={20}
                  color={prayer.name === nextPrayer ? COLORS.white : COLORS.primary}
                />
              </View>
              <View>
                <Text
                  style={[
                    styles.prayerName,
                    prayer.name === nextPrayer && styles.prayerNameActive,
                  ]}
                >
                  {prayer.name}
                </Text>
              </View>
            </View>
            <View style={styles.prayerRight}>
              <Text
                style={[
                  styles.prayerTime,
                  prayer.name === nextPrayer && styles.prayerTimeActive,
                ]}
              >
                {prayer.time}
              </Text>
              <TouchableOpacity>
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={prayer.name === nextPrayer ? COLORS.white : COLORS.gray}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
        <Text style={styles.infoText}>
          Waktu sholat berdasarkan perhitungan untuk wilayah Jakarta. Metode: Kemenag RI.
        </Text>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
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
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.white,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    fontSize: SIZES.font,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 6,
  },
  countdownCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  countdownLabel: {
    fontSize: SIZES.font,
    color: 'rgba(255,255,255,0.7)',
  },
  countdownTime: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 6,
  },
  currentDate: {
    fontSize: SIZES.small,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
  },
  prayerList: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  prayerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
  },
  prayerItemActive: {
    backgroundColor: COLORS.primary,
    borderBottomColor: 'transparent',
  },
  prayerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconContainerActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  prayerName: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  prayerNameActive: {
    color: COLORS.white,
  },
  prayerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerTime: {
    fontSize: SIZES.large,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginRight: 12,
  },
  prayerTimeActive: {
    color: COLORS.white,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginLeft: 10,
    lineHeight: 18,
  },
});

export default PrayerTimesScreen;
