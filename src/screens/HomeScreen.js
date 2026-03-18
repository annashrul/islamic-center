import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRAYER_NAMES_ID } from '../data/adzanPrayer';
import { SIZES } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import { fetchPrayerTimes, fetchHijriCalendar } from '../services/apiService';
import { getUserLocation } from '../services/locationService';
import { getMostRecentLastRead } from '../services/lastReadService';


const SHOWN_PRAYERS = Object.keys(PRAYER_NAMES_ID);
const PRAYER_ICONS = {
    Fajr: 'sunny-outline', Sunrise: 'sunny', Dhuhr: 'sunny',
    Asr: 'partly-sunny', Maghrib: 'cloudy-night', Isha: 'moon',
};

const HomeScreen = ({ navigation }) => {
    const { colors: COLORS, t } = useSettings();
    const styles = makeStyles(COLORS);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [nextPrayer, setNextPrayer] = useState('');
    const [nextPrayerTime, setNextPrayerTime] = useState('');
    const [hijriDate, setHijriDate] = useState('');
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [loadingPrayer, setLoadingPrayer] = useState(true);
    const [locationName, setLocationName] = useState('');
    const [lastRead, setLastRead] = useState(null);
    const [agenda, setAgenda] = useState([]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => { loadData(); }, []);

    useEffect(() => {
        if (prayerTimes) {
            const now = new Date();
            const currentMin = now.getHours() * 60 + now.getMinutes();
            const prayers = SHOWN_PRAYERS.map((key) => {
                const t = prayerTimes[key];
                if (!t) return null;
                const [h, m] = t.split(':').map(Number);
                return { name: PRAYER_NAMES_ID[key], total: h * 60 + m, time: t, key };
            }).filter(Boolean);
            const next = prayers.find((p) => p.total > currentMin);
            setNextPrayer(next ? next.name : prayers[0]?.name || '');
            setNextPrayerTime(next ? next.time : prayers[0]?.time || '');
        }
    }, [prayerTimes, currentTime]);

    const loadData = async () => {
        try {
            const [location, savedLastRead] = await Promise.all([
                getUserLocation(),
                getMostRecentLastRead(),
            ]);
            setLocationName(location.fullAddress);
            if (savedLastRead) setLastRead(savedLastRead);

            const prayerData = await fetchPrayerTimes(location.latitude, location.longitude);
            setPrayerTimes(prayerData.timings);
            const hijri = prayerData.hijri;
            if (hijri) setHijriDate(`${hijri.day} ${hijri.month.en} ${hijri.year} H`);

            // Load agenda (Islamic events this month)
            const now = new Date();
            const calData = await fetchHijriCalendar(now.getFullYear(), now.getMonth() + 1, location.latitude, location.longitude);
            const events = calData.filter(d => d.hijri?.holidays?.length > 0).map(d => ({
                day: d.gregorian.day,
                month: d.gregorian.month,
                weekday: d.gregorian.weekday,
                hijriDay: d.hijri.day,
                hijriMonth: d.hijri.monthEn,
                hijriYear: d.hijri.year,
                holidays: d.hijri.holidays,
                isPast: new Date(d.gregorian.year, d.gregorian.month - 1, d.gregorian.day) < new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            }));
            setAgenda(events);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingPrayer(false);
        }
    };

    const formatTime = (date) =>
        date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const formatDate = (date) =>
        date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const quickActions = [
        { icon: 'time-outline', label: t.menu_prayer, nav: 'Home_PrayerTimes', bg: COLORS.accentLight, color: COLORS.accent },
        { icon: 'radio-button-on-outline', label: t.menu_tasbih, nav: 'Home_Tasbih', bg: COLORS.surfaceAlt, color: '#7E57C2' },
        { icon: 'star-outline', label: t.menu_asmaul, nav: 'Home_AsmaulHusna', bg: COLORS.primarySoft, color: COLORS.primary },
        { icon: 'heart-outline', label: t.menu_doa, nav: 'Home_Doa', bg: COLORS.surfaceAlt, color: '#E91E63' },
    ];

    return (
        <ScrollView style={[styles.container, { backgroundColor: COLORS.background }]} showsVerticalScrollIndicator={false}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: COLORS.primary }]}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greeting}>{t.greeting}</Text>
                        {locationName ? (
                            <View style={styles.locationRow}>
                                <Ionicons name="location-outline" size={13} color={COLORS.accent} />
                                <Text style={styles.locationText}>{locationName}</Text>
                            </View>
                        ) : null}
                    </View>
                    <View style={styles.headerTimeBox}>
                        <Text style={styles.headerTimeLarge}>{formatTime(currentTime)}</Text>
                    </View>
                </View>

                <Text style={styles.headerDate}>{formatDate(currentTime)}</Text>
                {hijriDate ? <Text style={styles.hijriDate}>{hijriDate}</Text> : null}

                {/* Next Prayer Card */}
                <View style={styles.nextPrayerCard}>
                    <View style={styles.nextPrayerLeft}>
                        <Text style={styles.nextPrayerLabel}>{t.next_prayer}</Text>
                        <Text style={styles.nextPrayerName}>{nextPrayer}</Text>
                    </View>
                    <View style={styles.nextPrayerRight}>
                        <Text style={styles.nextPrayerTime}>{nextPrayerTime}</Text>
                    </View>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
                {quickActions.map((item) => (
                    <TouchableOpacity key={item.label} style={styles.actionCard} onPress={() => navigation.navigate(item.nav)} activeOpacity={0.7}>
                        <View style={[styles.actionIcon, { backgroundColor: item.bg }]}>
                            <Ionicons name={item.icon} size={22} color={item.color} />
                        </View>
                        <Text style={styles.actionText}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Prayer Times */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t.prayer_times}</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Home_PrayerTimes')}>
                        <Text style={styles.seeAll}>{t.see_more}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.prayerCard}>
                    {loadingPrayer ? (
                        <ActivityIndicator size="small" color={COLORS.primary} style={{ padding: 24 }} />
                    ) : (
                        SHOWN_PRAYERS.map((key, idx) => {
                            const time = prayerTimes?.[key];
                            if (!time) return null;
                            const isNext = PRAYER_NAMES_ID[key] === nextPrayer;
                            return (
                                <View key={key} style={[styles.prayerRow, idx < SHOWN_PRAYERS.length - 1 && styles.prayerRowBorder]}>
                                    <View style={styles.prayerLeft}>
                                        <View style={[styles.prayerIcon, isNext && styles.prayerIconActive]}>
                                            <Ionicons name={PRAYER_ICONS[key]} size={16} color={isNext ? COLORS.white : COLORS.textMuted} />
                                        </View>
                                        <Text style={[styles.prayerName, isNext && styles.prayerNameActive]}>
                                            {PRAYER_NAMES_ID[key]}
                                        </Text>
                                        {isNext && <View style={styles.nextBadge}><Text style={styles.nextBadgeText}>{t.next_label}</Text></View>}
                                    </View>
                                    <Text style={[styles.prayerTime, isNext && styles.prayerTimeActive]}>{time}</Text>
                                </View>
                            );
                        })
                    )}
                </View>
            </View>

            {/* Last Read */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t.last_read}</Text>
                <TouchableOpacity
                    style={styles.lastReadCard}
                    onPress={() => {
                        if (lastRead) {
                            if (lastRead.type === 'juz') {
                                navigation.navigate('Quran');
                            } else {
                                navigation.navigate('Home_SurahDetail', {
                                    surah: {
                                        number: lastRead.surahNumber,
                                        name: lastRead.surahName,
                                        arabic: lastRead.surahArabic || '',
                                        meaning: lastRead.surahMeaning || '',
                                        verses: lastRead.surahVerses || 0,
                                        type: lastRead.surahType || '',
                                    },
                                    scrollToAyah: lastRead.ayahNumber,
                                });
                            }
                        } else {
                            navigation.navigate('Quran');
                        }
                    }}
                    activeOpacity={0.7}
                >
                    <View style={styles.lastReadIcon}>
                        <Ionicons name="book-outline" size={22} color={COLORS.primary} />
                    </View>
                    <View style={styles.lastReadInfo}>
                        <Text style={styles.lastReadSurah}>
                            {lastRead
                                ? lastRead.type === 'juz'
                                    ? `Juz ${lastRead.juzNumber} · ${lastRead.surahName}`
                                    : lastRead.surahName
                                : 'Belum ada'}
                        </Text>
                        <Text style={styles.lastReadAyah}>
                            {lastRead
                                ? lastRead.type === 'juz'
                                    ? `Ayat ${lastRead.ayahNumberInSurah || lastRead.ayahNumber}`
                                    : `Ayat ${lastRead.ayahNumber}`
                                : 'Mulai membaca Al-Quran'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
            </View>

            {/* Agenda */}
            {agenda.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t.agenda || 'Agenda'}</Text>
                    </View>
                    {agenda.slice(0, 5).map((ev, idx) => (
                        <View key={idx} style={[styles.agendaCard, ev.isPast && styles.agendaCardPast]}>
                            <View style={[styles.agendaDateBox, ev.isPast && styles.agendaDateBoxPast]}>
                                <Text style={[styles.agendaDay, ev.isPast && { color: COLORS.textMuted }]}>{ev.day}</Text>
                            </View>
                            <View style={styles.agendaInfo}>
                                <Text style={[styles.agendaName, ev.isPast && { color: COLORS.textMuted }]} numberOfLines={1}>
                                    {ev.holidays.join(', ')}
                                </Text>
                                <Text style={styles.agendaDate}>
                                    {ev.hijriDay} {ev.hijriMonth} {ev.hijriYear} H · {ev.weekday}
                                </Text>
                            </View>
                            {!ev.isPast && <Ionicons name="star" size={12} color={COLORS.accent} />}
                        </View>
                    ))}
                </View>
            )}

            <View style={{ height: 30 }} />
        </ScrollView>
    );
};

// Dynamic styles - called inside component to get current theme colors
const makeStyles = (C) => ({
    container: { flex: 1, backgroundColor: C.background },
    header: {
        backgroundColor: C.primary, paddingTop: 30, paddingBottom: 24, paddingHorizontal: 20,
        borderBottomLeftRadius: SIZES.radiusXl, borderBottomRightRadius: SIZES.radiusXl,
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    greeting: { fontSize: SIZES.title, fontWeight: '700', color: C.white, letterSpacing: -0.3 },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    locationText: { fontSize: SIZES.caption, color: 'rgba(255,255,255,0.6)', marginLeft: 4 },
    headerTimeBox: {
        backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: SIZES.radiusSm,
    },
    headerTimeLarge: { fontSize: SIZES.large, fontWeight: '700', color: C.white, letterSpacing: 1 },
    headerDate: { fontSize: SIZES.small, color: 'rgba(255,255,255,0.5)', marginTop: 12 },
    hijriDate: { fontSize: SIZES.small, color: C.accent, marginTop: 2, fontWeight: '500' },
    nextPrayerCard: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: SIZES.radius, padding: 16, marginTop: 16,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    nextPrayerLeft: {},
    nextPrayerLabel: { fontSize: SIZES.caption, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 },
    nextPrayerName: { fontSize: SIZES.title, fontWeight: '700', color: C.white, marginTop: 2 },
    nextPrayerRight: { backgroundColor: C.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: SIZES.radiusSm },
    nextPrayerTime: { fontSize: SIZES.large, fontWeight: '700', color: C.white },
    quickActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: -16 },
    actionCard: {
        alignItems: 'center', backgroundColor: C.surface, paddingVertical: 16, paddingHorizontal: 8,
        borderRadius: SIZES.radius, width: '23%', borderWidth: 1, borderColor: C.divider,
    },
    actionIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    actionText: { fontSize: SIZES.caption, color: C.textSecondary, fontWeight: '600', alignItems: 'center', justifyContent: 'center' },
    section: { paddingHorizontal: 20, marginTop: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: SIZES.large, fontWeight: '700', color: C.textPrimary, letterSpacing: -0.3 },
    seeAll: { fontSize: SIZES.small, color: C.primary, fontWeight: '600' },
    prayerCard: { backgroundColor: C.surface, borderRadius: SIZES.radius, borderWidth: 1, borderColor: C.divider },
    prayerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
    prayerRowBorder: { borderBottomWidth: 1, borderBottomColor: C.divider },
    prayerLeft: { flexDirection: 'row', alignItems: 'center' },
    prayerIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: C.surfaceAlt, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    prayerIconActive: { backgroundColor: C.primary },
    prayerName: { fontSize: SIZES.font, color: C.textSecondary, fontWeight: '500' },
    prayerNameActive: { color: C.primary, fontWeight: '700' },
    prayerTime: { fontSize: SIZES.font, color: C.textSecondary, fontWeight: '600' },
    prayerTimeActive: { color: C.primary, fontWeight: '700' },
    nextBadge: { backgroundColor: C.primarySoft, paddingHorizontal: 8, paddingVertical: 2, borderRadius: SIZES.radiusFull, marginLeft: 8 },
    nextBadgeText: { fontSize: 9, color: C.primary, fontWeight: '700' },
    lastReadCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface,
        padding: 16, borderRadius: SIZES.radius, marginTop: 8, borderWidth: 1, borderColor: C.divider,
    },
    lastReadIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center' },
    lastReadInfo: { flex: 1, marginLeft: 14 },
    lastReadSurah: { fontSize: SIZES.medium, fontWeight: '600', color: C.textPrimary },
    lastReadAyah: { fontSize: SIZES.small, color: C.textMuted, marginTop: 2 },

    // Agenda
    agendaCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface,
        borderRadius: SIZES.radiusSm, padding: 12, marginBottom: 8,
        borderWidth: 1, borderColor: C.divider,
    },
    agendaCardPast: { opacity: 0.45 },
    agendaDateBox: {
        width: 40, height: 40, borderRadius: 10, backgroundColor: C.accentLight,
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    agendaDateBoxPast: { backgroundColor: C.surfaceAlt },
    agendaDay: { fontSize: SIZES.medium, fontWeight: '700', color: C.accent },
    agendaInfo: { flex: 1 },
    agendaName: { fontSize: SIZES.font, fontWeight: '600', color: C.textPrimary },
    agendaDate: { fontSize: SIZES.caption, color: C.textMuted, marginTop: 2 },
});

export default HomeScreen;
