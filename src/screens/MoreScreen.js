import React from 'react';
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

const MENU_ITEMS = [
  {
    section: 'Fitur Utama',
    items: [
      { icon: 'book', color: COLORS.primary, title: 'Al-Quran', subtitle: 'Baca Al-Quran dengan terjemahan' },
      { icon: 'time', color: '#FF9800', title: 'Jadwal Sholat', subtitle: 'Waktu sholat harian' },
      { icon: 'compass', color: '#2196F3', title: 'Arah Kiblat', subtitle: 'Kompas arah kiblat' },
      { icon: 'heart', color: '#9C27B0', title: 'Doa Harian', subtitle: 'Kumpulan doa sehari-hari' },
    ],
  },
  {
    section: 'Lainnya',
    items: [
      { icon: 'calendar', color: '#4CAF50', title: 'Kalender Hijriyah', subtitle: 'Kalender Islam' },
      { icon: 'musical-notes', color: '#E91E63', title: 'Asmaul Husna', subtitle: '99 Nama Allah' },
      { icon: 'people', color: '#00BCD4', title: 'Kisah Nabi', subtitle: '25 Kisah Nabi & Rasul' },
      { icon: 'calculator', color: '#795548', title: 'Kalkulator Zakat', subtitle: 'Hitung zakat Anda' },
    ],
  },
  {
    section: 'Pengaturan',
    items: [
      { icon: 'notifications-outline', color: COLORS.gray, title: 'Notifikasi', subtitle: 'Atur pengingat sholat' },
      { icon: 'moon-outline', color: COLORS.gray, title: 'Tema', subtitle: 'Mode gelap/terang' },
      { icon: 'language-outline', color: COLORS.gray, title: 'Bahasa', subtitle: 'Indonesia' },
      { icon: 'information-circle-outline', color: COLORS.gray, title: 'Tentang', subtitle: 'Islamic Center v1.0' },
    ],
  },
];

const MoreScreen = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={COLORS.white} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Assalamu'alaikum</Text>
            <Text style={styles.profileSubtitle}>Selamat datang di Islamic Center</Text>
          </View>
        </View>
      </View>

      {MENU_ITEMS.map((section) => (
        <View key={section.section} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.section}</Text>
          <View style={styles.sectionCard}>
            {section.items.map((item, index) => (
              <TouchableOpacity
                key={item.title}
                style={[
                  styles.menuItem,
                  index < section.items.length - 1 && styles.menuItemBorder,
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                    <Ionicons name={item.icon} size={22} color={item.color} />
                  </View>
                  <View>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.lightGray} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Islamic Center App v1.0</Text>
        <Text style={styles.footerText}>Made with love for Ummah</Text>
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
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 14,
  },
  profileName: {
    fontSize: SIZES.large,
    fontWeight: '700',
    color: COLORS.white,
  },
  profileSubtitle: {
    fontSize: SIZES.font,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: SIZES.font,
    fontWeight: '700',
    color: COLORS.gray,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  menuSubtitle: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    paddingBottom: 10,
  },
  footerText: {
    fontSize: SIZES.small,
    color: COLORS.lightGray,
    marginTop: 4,
  },
});

export default MoreScreen;
