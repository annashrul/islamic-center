import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import {
    requestNotificationPermission, scheduleAdzanNotifications, getScheduledNotifications,
} from '../services/adzanService';
import { getUserLocation } from '../services/locationService';
import { useSettings } from '../context/SettingsContext';

const PRAYER_OPTIONS = [
    { key: 'Fajr', name: 'Subuh', icon: 'sunny-outline' },
    { key: 'Dhuhr', name: 'Dzuhur', icon: 'sunny' },
    { key: 'Asr', name: 'Ashar', icon: 'partly-sunny' },
    { key: 'Maghrib', name: 'Maghrib', icon: 'cloudy-night' },
    { key: 'Isha', name: 'Isya', icon: 'moon' },
];

const NotificationSettingsScreen = ({ navigation }) => {
    const { colors: COLORS, t } = useSettings();
    const styles = makeStyles(COLORS);
    const [adzanEnabled, setAdzanEnabled] = useState(true);
    const [scheduledCount, setScheduledCount] = useState(0);
    const [prayerToggles, setPrayerToggles] = useState({
        Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true,
    });
    const [permissionGranted, setPermissionGranted] = useState(false);

    useEffect(() => { checkStatus(); }, []);

    const checkStatus = async () => {
        const granted = await requestNotificationPermission();
        setPermissionGranted(granted);
        const scheduled = await getScheduledNotifications();
        setScheduledCount(scheduled.length);
        setAdzanEnabled(scheduled.length > 0);
    };

    const toggleMasterAdzan = async () => {
        if (adzanEnabled) {
            const Notifications = require('expo-notifications');
            await Notifications.cancelAllScheduledNotificationsAsync();
            setAdzanEnabled(false);
            setScheduledCount(0);
        } else {
            const granted = await requestNotificationPermission();
            if (granted) {
                const location = await getUserLocation();
                await scheduleAdzanNotifications(location.latitude, location.longitude);
                const scheduled = await getScheduledNotifications();
                setScheduledCount(scheduled.length);
                setAdzanEnabled(true);
            } else {
                Alert.alert('Izin Diperlukan', 'Aktifkan izin notifikasi di pengaturan HP.');
            }
        }
    };

    const togglePrayer = (key) => {
        setPrayerToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const Toggle = ({ value, onPress }) => (
        <TouchableOpacity style={[styles.toggle, value && styles.toggleActive]} onPress={onPress}>
            <View style={[styles.toggleDot, value && styles.toggleDotActive]} />
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifikasi</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Permission Status */}
            <View style={styles.statusCard}>
                <View style={[styles.statusIcon, permissionGranted ? styles.statusIconOk : styles.statusIconWarn]}>
                    <Ionicons name={permissionGranted ? 'checkmark-circle' : 'warning'} size={20} color={permissionGranted ? COLORS.primary : '#E6960A'} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.statusTitle}>
                        {permissionGranted ? 'Izin notifikasi aktif' : 'Izin notifikasi belum diberikan'}
                    </Text>
                    <Text style={styles.statusSub}>
                        {permissionGranted ? `${scheduledCount} adzan terjadwal hari ini` : 'Aktifkan untuk menerima pengingat sholat'}
                    </Text>
                </View>
            </View>

            {/* Master Toggle */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>ADZAN OTOMATIS</Text>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="volume-high-outline" size={20} color={COLORS.primary} />
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.rowTitle}>Auto Play Adzan</Text>
                                <Text style={styles.rowSub}>Putar suara adzan saat waktu sholat tiba</Text>
                            </View>
                        </View>
                        <Toggle value={adzanEnabled} onPress={toggleMasterAdzan} />
                    </View>
                </View>
            </View>

            {/* Per-Prayer Toggles */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>PENGINGAT PER WAKTU SHOLAT</Text>
                <View style={styles.card}>
                    {PRAYER_OPTIONS.map((prayer, idx) => (
                        <View key={prayer.key} style={[styles.row, idx < PRAYER_OPTIONS.length - 1 && styles.rowBorder]}>
                            <View style={styles.rowLeft}>
                                <View style={styles.prayerIcon}>
                                    <Ionicons name={prayer.icon} size={16} color={COLORS.textMuted} />
                                </View>
                                <Text style={styles.rowTitle}>{prayer.name}</Text>
                            </View>
                            <Toggle value={prayerToggles[prayer.key]} onPress={() => togglePrayer(prayer.key)} />
                        </View>
                    ))}
                </View>
            </View>

            {/* Reminder Options */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>PENGINGAT LAINNYA</Text>
                <View style={styles.card}>
                    <View style={[styles.row, styles.rowBorder]}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="book-outline" size={20} color={COLORS.primary} />
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.rowTitle}>Pengingat Baca Quran</Text>
                                <Text style={styles.rowSub}>Ingatkan untuk membaca Al-Quran setiap hari</Text>
                            </View>
                        </View>
                        <Toggle value={false} onPress={() => Alert.alert('Segera Hadir', 'Fitur ini akan tersedia di versi berikutnya.')} />
                    </View>
                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="sunny-outline" size={20} color={COLORS.primary} />
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.rowTitle}>Pengingat Dzikir Pagi</Text>
                                <Text style={styles.rowSub}>Ingatkan untuk dzikir pagi setiap hari</Text>
                            </View>
                        </View>
                        <Toggle value={false} onPress={() => Alert.alert('Segera Hadir', 'Fitur ini akan tersedia di versi berikutnya.')} />
                    </View>
                </View>
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

    statusCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface,
        marginHorizontal: 20, marginTop: 20, padding: 16, borderRadius: SIZES.radius,
        borderWidth: 1, borderColor: C.divider,
    },
    statusIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    statusIconOk: { backgroundColor: C.primarySoft },
    statusIconWarn: { backgroundColor: C.accentLight },
    statusTitle: { fontSize: SIZES.font, fontWeight: '600', color: C.textPrimary },
    statusSub: { fontSize: SIZES.caption, color: C.textMuted, marginTop: 2 },

    section: { marginTop: 24, paddingHorizontal: 20 },
    sectionLabel: { fontSize: SIZES.caption, fontWeight: '700', color: C.textMuted, letterSpacing: 0.8, marginBottom: 8 },
    card: { backgroundColor: C.surface, borderRadius: SIZES.radius, borderWidth: 1, borderColor: C.divider },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: C.divider },
    rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
    rowTitle: { fontSize: SIZES.font, fontWeight: '600', color: C.textPrimary },
    rowSub: { fontSize: SIZES.caption, color: C.textMuted, marginTop: 2 },
    prayerIcon: {
        width: 32, height: 32, borderRadius: 8, backgroundColor: C.surfaceAlt,
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    toggle: {
        width: 48, height: 28, borderRadius: 14, backgroundColor: C.border,
        justifyContent: 'center', paddingHorizontal: 3,
    },
    toggleActive: { backgroundColor: C.primary },
    toggleDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.white },
    toggleDotActive: { alignSelf: 'flex-end' },
});

export default NotificationSettingsScreen;
