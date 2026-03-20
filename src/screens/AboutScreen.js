import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';

const APP_VERSION = '1.0.0';

const FEATURES = [
    { icon: 'book-outline', title: 'Al-Quran', desc: 'Baca Al-Quran dengan terjemahan Indonesia, audio Mishary Alafasy, dan auto-play' },
    { icon: 'time-outline', title: 'Jadwal Sholat', desc: 'Waktu sholat akurat berdasarkan lokasi GPS, notifikasi adzan otomatis' },
    { icon: 'compass-outline', title: 'Arah Kiblat', desc: 'Kompas kiblat real-time menggunakan sensor heading' },
    { icon: 'heart-outline', title: 'Doa Harian', desc: '37+ doa sehari-hari lengkap Arab, Latin, dan artinya' },
    { icon: 'radio-button-on-outline', title: 'Tasbih Digital', desc: 'Counter dzikir visual dengan 6 pilihan dzikir' },
    { icon: 'star-outline', title: 'Asmaul Husna', desc: '99 Nama Allah dengan audio text-to-speech' },
    { icon: 'people-outline', title: 'Kisah Nabi', desc: '28 kisah nabi lengkap dari API' },
    { icon: 'document-text-outline', title: 'Hadits', desc: 'Hadits dari 6 kitab: Bukhari, Muslim, Tirmidzi, Abu Dawud, Ibnu Majah, Nasai' },
    { icon: 'sunny-outline', title: 'Dzikir Pagi & Petang', desc: 'Amalan harian lengkap dengan teks Arab dan Latin' },
    { icon: 'calculator-outline', title: 'Kalkulator Zakat', desc: 'Hitung zakat mal dan zakat penghasilan' },
];

const API_SOURCES = [
    { name: 'Al-Quran Cloud API', url: 'https://alquran.cloud/api', use: 'Data Al-Quran & Audio' },
    { name: 'Aladhan API', url: 'https://aladhan.com', use: 'Jadwal Sholat, Hijriyah, Kiblat' },
    { name: 'Hadith API (fawazahmed0)', url: 'https://github.com/fawazahmed0/hadith-api', use: 'Data Hadits' },
    { name: 'Doa API', url: 'https://doa-doa-api-ahmadramadhan.fly.dev', use: 'Doa Harian' },
    { name: 'Asmaul Husna API', url: 'https://asmaul-husna-api.vercel.app', use: '99 Nama Allah' },
    { name: 'Islamic API (zhirrr)', url: 'https://islamic-api-zhirrr.vercel.app', use: 'Kisah Nabi' },
];

const AboutScreen = ({ navigation }) => {
    const { colors: COLORS, t } = useSettings();
    const styles = makeStyles(COLORS);
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tentang</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* App Identity */}
            <View style={styles.identitySection}>
                <View style={styles.appIcon}>
                    <Ionicons name="moon" size={36} color={COLORS.primary} />
                </View>
                <Text style={styles.appName}>Islamic Center</Text>
                <Text style={styles.appTagline}>Teman ibadah harian Anda</Text>
                <View style={styles.versionBadge}>
                    <Text style={styles.versionText}>Versi {APP_VERSION}</Text>
                </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
                <View style={styles.card}>
                    <Text style={styles.descText}>
                        Islamic Center adalah aplikasi Islami yang dirancang untuk membantu umat Muslim dalam menjalankan ibadah sehari-hari. Dilengkapi dengan Al-Quran, jadwal sholat, arah kiblat, dan berbagai fitur keislaman lainnya.
                    </Text>
                </View>
            </View>

            {/* Features */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>FITUR</Text>
                <View style={styles.card}>
                    {FEATURES.map((feat, idx) => (
                        <View key={feat.title} style={[styles.featureRow, idx < FEATURES.length - 1 && styles.rowBorder]}>
                            <View style={styles.featureIcon}>
                                <Ionicons name={feat.icon} size={18} color={COLORS.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.featureTitle}>{feat.title}</Text>
                                <Text style={styles.featureDesc}>{feat.desc}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* API Sources */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>SUMBER DATA (API)</Text>
                <View style={styles.card}>
                    {API_SOURCES.map((source, idx) => (
                        <TouchableOpacity
                            key={source.name}
                            style={[styles.sourceRow, idx < API_SOURCES.length - 1 && styles.rowBorder]}
                            onPress={() => Linking.openURL(source.url).catch(() => { })}
                            activeOpacity={0.6}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={styles.sourceName}>{source.name}</Text>
                                <Text style={styles.sourceUse}>{source.use}</Text>
                            </View>
                            <Ionicons name="open-outline" size={14} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Tech Stack */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>TEKNOLOGI</Text>
                <View style={styles.card}>
                    {[
                        { label: 'Framework', value: 'React Native + Expo' },
                        { label: 'SDK', value: 'Expo SDK 54' },
                        { label: 'Navigasi', value: 'React Navigation 6' },
                        { label: 'Audio', value: 'Expo AV' },
                        { label: 'Lokasi', value: 'Expo Location' },
                        { label: 'Sensor', value: 'Expo Sensors (Magnetometer)' },
                        { label: 'Notifikasi', value: 'Expo Notifications' },
                        { label: 'Storage', value: 'AsyncStorage' },
                    ].map((item, idx, arr) => (
                        <View key={item.label} style={[styles.techRow, idx < arr.length - 1 && styles.rowBorder]}>
                            <Text style={styles.techLabel}>{item.label}</Text>
                            <Text style={styles.techValue}>{item.value}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Credits */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>KREDIT</Text>
                <View style={styles.card}>
                    <View style={styles.creditRow}>
                        <Ionicons name="musical-notes-outline" size={16} color={COLORS.textMuted} />
                        <Text style={styles.creditText}>Audio Al-Quran: Syekh Mishary Rashid Alafasy</Text>
                    </View>
                    <View style={[styles.creditRow, { borderTopWidth: 1, borderTopColor: COLORS.divider }]}>
                        <Ionicons name="volume-high-outline" size={16} color={COLORS.textMuted} />
                        <Text style={styles.creditText}>Audio Adzan: IslamDownload.net</Text>
                    </View>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerArabic}>{'\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064E\u0647\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0670\u0646\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645\u0650'}</Text>
                <Text style={styles.footerText}>Dibuat dengan penuh cinta untuk Ummah</Text>
                <Text style={styles.footerCopy}>&copy; 2026 Islamic Center App</Text>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const makeStyles = (C) => ({
    container: { flex: 1, backgroundColor: C.background },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: C.primary, paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16,
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: SIZES.large, fontWeight: '700', color: C.white },

    identitySection: { alignItems: 'center', paddingVertical: 30 },
    appIcon: {
        width: 72, height: 72, borderRadius: 20, backgroundColor: C.primarySoft,
        justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    },
    appName: { fontSize: SIZES.title, fontWeight: '700', color: C.textPrimary, letterSpacing: -0.3 },
    appTagline: { fontSize: SIZES.font, color: C.textMuted, marginTop: 4 },
    versionBadge: {
        marginTop: 10, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20,
        backgroundColor: C.primarySoft,
    },
    versionText: { fontSize: SIZES.caption, fontWeight: '600', color: C.primary },

    section: { marginTop: 8, paddingHorizontal: 20, marginBottom: 12 },
    sectionLabel: { fontSize: SIZES.caption, fontWeight: '700', color: C.textMuted, letterSpacing: 0.8, marginBottom: 8 },
    card: { backgroundColor: C.surface, borderRadius: SIZES.radius, borderWidth: 1, borderColor: C.divider },

    descText: { fontSize: SIZES.font, color: C.textSecondary, lineHeight: 22, padding: 16 },

    featureRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 14 },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: C.divider },
    featureIcon: {
        width: 32, height: 32, borderRadius: 8, backgroundColor: C.primarySoft,
        justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2,
    },
    featureTitle: { fontSize: SIZES.font, fontWeight: '600', color: C.textPrimary },
    featureDesc: { fontSize: SIZES.caption, color: C.textMuted, marginTop: 2, lineHeight: 16 },

    sourceRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
    sourceName: { fontSize: SIZES.font, fontWeight: '600', color: C.primary },
    sourceUse: { fontSize: SIZES.caption, color: C.textMuted, marginTop: 2 },

    techRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
    techLabel: { fontSize: SIZES.font, color: C.textMuted },
    techValue: { fontSize: SIZES.font, fontWeight: '600', color: C.textPrimary },

    creditRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
    creditText: { fontSize: SIZES.font, color: C.textSecondary, marginLeft: 10 },

    footer: { alignItems: 'center', marginTop: 20, paddingVertical: 20 },
    footerArabic: { fontSize: 20, color: C.accent },
    footerText: { fontSize: SIZES.small, color: C.textMuted, marginTop: 8 },
    footerCopy: { fontSize: SIZES.caption, color: C.textMuted, marginTop: 4 },
});

export default AboutScreen;
