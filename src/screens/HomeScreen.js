import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import PrayerTimeCard from '../components/PrayerTimeCard';

const PRAYER_TIMES = [
  { name: 'Subuh', time: '04:35' },
  { name: 'Terbit', time: '05:52' },
  { name: 'Dzuhur', time: '11:55' },
  { name: 'Ashar', time: '15:13' },
  { name: 'Maghrib', time: '17:55' },
  { name: 'Isya', time: '19:08' },
];

const HomeScreen = ({ navigation }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState('Dzuhur');
  const [hijriDate, setHijriDate] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentMinutes = hours * 60 + minutes;

    const prayerMinutes = PRAYER_TIMES.map((p) => {
      const [h, m] = p.time.split(':').map(Number);
      return { name: p.name, total: h * 60 + m };
    });

    const next = prayerMinutes.find((p) => p.total > currentMinutes);
    if (next) setNextPrayer(next.name);
    else setNextPrayer(prayerMinutes[0].name);

    const day = now.getDate();
    const month = now.getMonth();
    const hijriMonths = [
      'Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir',
      'Jumadil Awal', 'Jumadil Akhir', 'Rajab', 'Syaban',
      'Ramadhan', 'Syawal', 'Dzulqaidah', 'Dzulhijjah',
    ];
    setHijriDate(`${day} ${hijriMonths[month]} 1447 H`);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Assalamu'alaikum</Text>
          <Text style={styles.headerTime}>{formatTime(currentTime)}</Text>
          <Text style={styles.headerDate}>{formatDate(currentTime)}</Text>
          <Text style={styles.hijriDate}>{hijriDate}</Text>

          <View style={styles.nextPrayerBanner}>
            <Ionicons name="time-outline" size={18} color={COLORS.secondary} />
            <Text style={styles.nextPrayerText}>
              Waktu sholat selanjutnya: <Text style={styles.nextPrayerName}>{nextPrayer}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.mosqueDecor}>
          <Ionicons name="moon-outline" size={24} color="rgba(255,255,255,0.3)" />
        </View>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Quran')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="book" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.actionText}>Al-Quran</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('PrayerTimes')}>
          <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="time" size={24} color="#FF9800" />
          </View>
          <Text style={styles.actionText}>Jadwal{'\n'}Sholat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Qibla')}>
          <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="compass" size={24} color="#2196F3" />
          </View>
          <Text style={styles.actionText}>Arah{'\n'}Kiblat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Doa')}>
          <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
            <Ionicons name="heart" size={24} color="#9C27B0" />
          </View>
          <Text style={styles.actionText}>Doa{'\n'}Harian</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.prayerSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Waktu Sholat Hari Ini</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PrayerTimes')}>
            <Text style={styles.seeAll}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {PRAYER_TIMES.map((prayer) => (
          <PrayerTimeCard
            key={prayer.name}
            name={prayer.name}
            time={prayer.time}
            isNext={prayer.name === nextPrayer}
          />
        ))}
      </View>

      <View style={styles.lastReadSection}>
        <Text style={styles.sectionTitle}>Terakhir Dibaca</Text>
        <TouchableOpacity
          style={styles.lastReadCard}
          onPress={() => navigation.navigate('Quran')}
        >
          <View style={styles.lastReadLeft}>
            <Ionicons name="book-outline" size={24} color={COLORS.primary} />
            <View style={styles.lastReadInfo}>
              <Text style={styles.lastReadSurah}>Al-Fatihah</Text>
              <Text style={styles.lastReadAyah}>Ayat 1 - 7</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        </TouchableOpacity>
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
  headerGradient: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: SIZES.large,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  headerTime: {
    fontSize: 42,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 2,
  },
  headerDate: {
    fontSize: SIZES.font,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  hijriDate: {
    fontSize: SIZES.font,
    color: COLORS.secondary,
    marginTop: 4,
    fontWeight: '500',
  },
  nextPrayerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginTop: 16,
  },
  nextPrayerText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    marginLeft: 8,
  },
  nextPrayerName: {
    fontWeight: '700',
    color: COLORS.secondary,
  },
  mosqueDecor: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginTop: -15,
    marginBottom: 20,
  },
  actionCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    width: '22%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 11,
    color: COLORS.darkGray,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 15,
  },
  prayerSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 12,
    marginHorizontal: 16,
    marginTop: 8,
  },
  seeAll: {
    fontSize: SIZES.font,
    color: COLORS.primary,
    fontWeight: '600',
  },
  lastReadSection: {
    paddingHorizontal: 0,
    marginBottom: 10,
  },
  lastReadCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  lastReadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastReadInfo: {
    marginLeft: 12,
  },
  lastReadSurah: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  lastReadAyah: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: 2,
  },
});

export default HomeScreen;
