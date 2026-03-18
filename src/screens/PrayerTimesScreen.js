import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
    ActivityIndicator, Alert, Animated,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { SIZES, SHADOWS } from '../constants/theme';
import { fetchPrayerTimes } from '../services/apiService';
import {
    requestNotificationPermission, scheduleAdzanNotifications,
    getScheduledNotifications,
} from '../services/adzanService';
import { getUserLocation } from '../services/locationService';
import { PRAYER_NAMES_ID } from '../data/adzanPrayer';



const PRAYER_ICONS = {
    Imsak: 'moon-outline', Fajr: 'sunny-outline', Sunrise: 'sunny',
    Dhuhr: 'sunny', Asr: 'partly-sunny', Maghrib: 'cloudy-night', Isha: 'moon',
};

const SHOWN_PRAYERS = Object.keys(PRAYER_NAMES_ID);
const ADZAN_PRAYERS = Object.keys(PRAYER_NAMES_ID);

import { ADZAN_AUDIO_URL, ADZAN_SUBUH_URL } from '../constants/apiUrls';
import { useSettings } from '../context/SettingsContext';

const PrayerTimesScreen = () => {
    const { colors: COLORS, t } = useSettings();
    const styles = makeStyles(COLORS);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [hijriDate, setHijriDate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [nextPrayer, setNextPrayer] = useState(null);
    const [countdown, setCountdown] = useState('');
    const [locationName, setLocationName] = useState(t.loading_location);
    const [locationCoords, setLocationCoords] = useState('');
    const [latitude, setLatitude] = useState(-6.2088);
    const [longitude, setLongitude] = useState(106.8456);
    const [adzanEnabled, setAdzanEnabled] = useState(true);
    const [scheduledCount, setScheduledCount] = useState(0);
    const [playingAdzan, setPlayingAdzan] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioLoading, setAudioLoading] = useState(false);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);

    const soundRef = useRef(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isPlaying) {
            const pulse = Animated.loop(Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.12, duration: 800, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            ]));
            pulse.start();
            return () => pulse.stop();
        } else { pulseAnim.setValue(1); }
    }, [isPlaying]);

    useEffect(() => { return () => { stopAudio(); }; }, []);
    useEffect(() => { loadData(); }, []);
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            if (prayerTimes) calculateNextPrayer(now, prayerTimes);
        }, 1000);
        return () => clearInterval(timer);
    }, [prayerTimes]);

    const loadData = async () => {
        try {
            const location = await getUserLocation();
            setLatitude(location.latitude); setLongitude(location.longitude);
            setLocationName(location.fullAddress); setLocationCoords(location.coords);
            const prayerData = await fetchPrayerTimes(location.latitude, location.longitude);
            setPrayerTimes(prayerData.timings);
            const hijri = prayerData.hijri;
            if (hijri) setHijriDate(`${hijri.day} ${hijri.month.en} ${hijri.year} H`);
            calculateNextPrayer(new Date(), prayerData.timings);
            const scheduled = await getScheduledNotifications();
            setScheduledCount(scheduled.length);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const toggleAdzan = async () => {
        if (adzanEnabled) {
            const N = require('expo-notifications');
            await N.cancelAllScheduledNotificationsAsync();
            setAdzanEnabled(false); setScheduledCount(0);
            Alert.alert('Adzan', 'Notifikasi adzan dinonaktifkan.');
        } else {
            const granted = await requestNotificationPermission();
            if (granted) {
                await scheduleAdzanNotifications(latitude, longitude);
                const s = await getScheduledNotifications();
                setScheduledCount(s.length); setAdzanEnabled(true);
                Alert.alert('Adzan', `${s.length} adzan terjadwal hari ini.`);
            }
        }
    };

    const calculateNextPrayer = (now, timings) => {
        const currentMin = now.getHours() * 60 + now.getMinutes();
        const prayers = SHOWN_PRAYERS.map((key) => {
            const t = timings[key]; if (!t) return null;
            const [h, m] = t.split(':').map(Number);
            return { total: h * 60 + m, key };
        }).filter(Boolean);
        const next = prayers.find((p) => p.total > currentMin);
        if (next) {
            setNextPrayer(next.key);
            const diff = next.total - currentMin;
            const h = Math.floor(diff / 60); const m = diff % 60;
            setCountdown(h > 0 ? `${h}j ${m}m` : `${m} menit`);
        } else { setNextPrayer(prayers[0]?.key); setCountdown('Besok'); }
    };

    const stopAudio = async () => {
        if (soundRef.current) {
            try { await soundRef.current.stopAsync(); await soundRef.current.unloadAsync(); } catch (e) { }
            soundRef.current = null;
        }
        setIsPlaying(false); setPlayingAdzan(null); setAudioLoading(false); setPosition(0); setDuration(0);
    };

    const handlePlayAdzan = async (prayerKey) => {
        if (playingAdzan === prayerKey && soundRef.current) {
            const s = await soundRef.current.getStatusAsync();
            if (s.isPlaying) { await soundRef.current.pauseAsync(); setIsPlaying(false); }
            else { await soundRef.current.playAsync(); setIsPlaying(true); }
            return;
        }
        await stopAudio(); setAudioLoading(true); setPlayingAdzan(prayerKey);
        try {
            await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true, staysActiveInBackground: true });
            const url = prayerKey === 'Fajr' ? ADZAN_SUBUH_URL : ADZAN_AUDIO_URL;
            const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true, volume: 1.0 });
            soundRef.current = sound; setIsPlaying(true); setAudioLoading(false);
            sound.setOnPlaybackStatusUpdate((st) => {
                if (st.isLoaded) { setDuration(st.durationMillis || 0); setPosition(st.positionMillis || 0); if (st.didJustFinish) stopAudio(); }
            });
        } catch (e) { setAudioLoading(false); setPlayingAdzan(null); }
    };

    const togglePlayPause = async () => {
        if (!soundRef.current) return;
        const s = await soundRef.current.getStatusAsync();
        if (s.isPlaying) { await soundRef.current.pauseAsync(); setIsPlaying(false); }
        else { await soundRef.current.playAsync(); setIsPlaying(true); }
    };

    const seekBy = async (ms) => {
        if (!soundRef.current) return;
        const p = Math.max(0, Math.min(duration, position + ms));
        await soundRef.current.setPositionAsync(p);
    };

    const fmtMs = (ms) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`; };
    const progress = duration > 0 ? (position / duration) * 100 : 0;

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 12, color: COLORS.textMuted }}>{t.loading}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={playingAdzan ? { paddingBottom: 170 } : {}}>
                <StatusBar barStyle="light-content" />

                {/* ===== HEADER ===== */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerTitle}>{t.prayer_title}</Text>
                            <View style={styles.locationRow}>
                                <Ionicons name="location-outline" size={13} color={COLORS.accent} />
                                <Text style={styles.locationText} numberOfLines={1}>{locationName}</Text>
                            </View>
                            {locationCoords ? <Text style={styles.coordsText}>{locationCoords}</Text> : null}
                        </View>
                        {hijriDate && (
                            <View style={styles.hijriBadge}>
                                <Text style={styles.hijriText}>{hijriDate}</Text>
                            </View>
                        )}
                    </View>

                    {/* Countdown */}
                    <View style={styles.countdownCard}>
                        <View style={styles.countdownLeft}>
                            <Text style={styles.countdownLabel}>Menuju {PRAYER_NAMES_ID[nextPrayer]}</Text>
                            <Text style={styles.countdownTime}>{countdown}</Text>
                        </View>
                        <View style={styles.countdownDivider} />
                        <View style={styles.countdownRight}>
                            <Text style={styles.countdownDate}>
                                {currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </Text>
                            <Text style={styles.countdownClock}>
                                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ===== PRAYER LIST ===== */}
                <View style={styles.prayerSection}>
                    {SHOWN_PRAYERS.map((key, idx) => {
                        const time = prayerTimes?.[key];
                        if (!time) return null;
                        const isNext = key === nextPrayer;
                        const canPlay = ADZAN_PRAYERS.includes(key);
                        const isPlayingThis = playingAdzan === key;
                        const isLast = idx === SHOWN_PRAYERS.length - 1;

                        return (
                            <View key={key} style={[
                                styles.prayerCard,
                                isNext && styles.prayerCardNext,
                                isPlayingThis && styles.prayerCardPlaying,
                            ]}>
                                {/* Left: icon + name */}
                                <Animated.View style={[
                                    styles.prayerIcon,
                                    isNext && styles.prayerIconNext,
                                    isPlayingThis && isPlaying && { transform: [{ scale: pulseAnim }] },
                                ]}>
                                    <Ionicons
                                        name={isPlayingThis && isPlaying ? 'volume-high' : PRAYER_ICONS[key]}
                                        size={18}
                                        color={isNext ? COLORS.white : isPlayingThis ? COLORS.white : COLORS.textMuted}
                                    />
                                </Animated.View>

                                <View style={styles.prayerInfo}>
                                    <Text style={[styles.prayerName, isNext && styles.textWhite]}>
                                        {PRAYER_NAMES_ID[key]}
                                    </Text>
                                    {isPlayingThis && isPlaying && (
                                        <Text style={styles.playingLabel}>Adzan diputar...</Text>
                                    )}
                                    {isNext && !isPlayingThis && (
                                        <Text style={styles.nextLabel}>Berikutnya</Text>
                                    )}
                                </View>

                                {/* Right: time + play btn */}
                                <Text style={[styles.prayerTime, isNext && styles.textWhite]}>{time}</Text>

                                {canPlay && (
                                    <TouchableOpacity
                                        style={[
                                            styles.playBtn,
                                            isNext && styles.playBtnOnNext,
                                            isPlayingThis && styles.playBtnActive,
                                        ]}
                                        onPress={() => handlePlayAdzan(key)}
                                        activeOpacity={0.7}
                                    >
                                        {audioLoading && isPlayingThis ? (
                                            <ActivityIndicator size={14} color={isNext ? COLORS.white : COLORS.primary} />
                                        ) : (
                                            <Ionicons
                                                name={isPlayingThis && isPlaying ? 'pause' : 'play'}
                                                size={14}
                                                color={isNext ? 'rgba(255,255,255,0.9)' : isPlayingThis ? COLORS.white : COLORS.primary}
                                            />
                                        )}
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* ===== NOTIFICATION TOGGLE ===== */}
                <View style={styles.notifCard}>
                    <View style={styles.notifLeft}>
                        <View style={[styles.notifIcon, adzanEnabled && styles.notifIconActive]}>
                            <Ionicons name={adzanEnabled ? 'notifications' : 'notifications-off-outline'} size={18} color={adzanEnabled ? COLORS.white : COLORS.textMuted} />
                        </View>
                        <View>
                            <Text style={styles.notifTitle}>Auto Adzan</Text>
                            <Text style={styles.notifSub}>{adzanEnabled ? `${scheduledCount} terjadwal` : 'Nonaktif'}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={[styles.toggleBtn, adzanEnabled && styles.toggleBtnActive]} onPress={toggleAdzan}>
                        <View style={[styles.toggleDot, adzanEnabled && styles.toggleDotActive]} />
                    </TouchableOpacity>
                </View>

                {/* ===== INFO ===== */}
                <View style={styles.infoCard}>
                    <Ionicons name="information-circle-outline" size={16} color={COLORS.textMuted} />
                    <Text style={styles.infoText}>Metode: Kemenag RI · Sumber: Aladhan.com</Text>
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>

            {/* ===== BOTTOM AUDIO PLAYER ===== */}
            {playingAdzan && (
                <View style={styles.audioPlayer}>
                    {/* Info row */}
                    <View style={styles.playerRow}>
                        <View style={styles.playerIconBox}>
                            <Ionicons name="volume-high" size={18} color={COLORS.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.playerTitle}>Adzan {PRAYER_NAMES_ID[playingAdzan]}</Text>
                            <Text style={styles.playerSub}>{prayerTimes?.[playingAdzan]} · {locationName}</Text>
                        </View>
                        <TouchableOpacity onPress={stopAudio} style={styles.playerClose}>
                            <Ionicons name="close" size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    </View>

                    {/* Progress */}
                    <View style={styles.progressRow}>
                        <Text style={styles.progressTime}>{fmtMs(position)}</Text>
                        <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, { width: `${progress}%` }]} />
                            <View style={[styles.progressThumb, { left: `${progress}%` }]} />
                        </View>
                        <Text style={styles.progressTime}>{fmtMs(duration)}</Text>
                    </View>

                    {/* Controls */}
                    <View style={styles.controlsRow}>
                        <TouchableOpacity onPress={() => seekBy(-10000)} style={styles.ctrlBtn}>
                            <Ionicons name="play-back" size={20} color={COLORS.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={togglePlayPause} style={styles.ctrlPlayBtn}>
                            {audioLoading ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color={COLORS.white} />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => seekBy(10000)} style={styles.ctrlBtn}>
                            <Ionicons name="play-forward" size={20} color={COLORS.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={stopAudio} style={styles.ctrlBtn}>
                            <Ionicons name="stop-circle-outline" size={22} color={COLORS.error} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

const makeStyles = (C) => ({
    container: { flex: 1, backgroundColor: C.background },

    // ===== HEADER =====
    header: {
        backgroundColor: C.primary, paddingTop: 30, paddingBottom: 20, paddingHorizontal: 20,
        borderBottomLeftRadius: SIZES.radiusXl, borderBottomRightRadius: SIZES.radiusXl,
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    headerTitle: { fontSize: SIZES.header, fontWeight: '700', color: C.white, letterSpacing: -0.5 },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    locationText: { fontSize: SIZES.small, color: 'rgba(255,255,255,0.6)', marginLeft: 4, flex: 1 },
    coordsText: { fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2, marginLeft: 17 },
    hijriBadge: {
        backgroundColor: 'rgba(201,168,76,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    },
    hijriText: { fontSize: 10, color: C.accent, fontWeight: '600' },

    countdownCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: SIZES.radius,
        padding: 16, marginTop: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    countdownLeft: { flex: 1 },
    countdownLabel: { fontSize: SIZES.caption, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 0.5 },
    countdownTime: { fontSize: SIZES.header, fontWeight: '700', color: C.white, marginTop: 2 },
    countdownDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: 16 },
    countdownRight: { alignItems: 'flex-end' },
    countdownDate: { fontSize: SIZES.small, color: 'rgba(255,255,255,0.5)' },
    countdownClock: { fontSize: SIZES.large, fontWeight: '700', color: 'rgba(255,255,255,0.8)', marginTop: 2, letterSpacing: 1 },

    // ===== PRAYER LIST =====
    prayerSection: { paddingHorizontal: 20, marginTop: 20 },
    prayerCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: C.surface, borderRadius: SIZES.radius,
        padding: 14, marginBottom: 8,
        borderWidth: 1, borderColor: C.divider,
    },
    prayerCardNext: {
        backgroundColor: C.primary,
        borderColor: C.primaryDark,
    },
    prayerCardPlaying: {
        backgroundColor: C.primarySoft, borderWidth: 1.5, borderColor: C.primary,
    },
    prayerIcon: {
        width: 38, height: 38, borderRadius: 10, backgroundColor: C.surfaceAlt,
        justifyContent: 'center', alignItems: 'center',
    },
    prayerIconNext: { backgroundColor: 'rgba(255,255,255,0.18)' },
    prayerInfo: { flex: 1, marginLeft: 12 },
    prayerName: { fontSize: SIZES.font, fontWeight: '600', color: C.textPrimary },
    textWhite: { color: C.white },
    playingLabel: { fontSize: 10, color: C.primary, fontWeight: '600', marginTop: 1 },
    nextLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 1 },
    prayerTime: { fontSize: SIZES.medium, fontWeight: '700', color: C.textPrimary, marginRight: 8 },
    playBtn: {
        width: 32, height: 32, borderRadius: 10, backgroundColor: C.primarySoft,
        justifyContent: 'center', alignItems: 'center',
    },
    playBtnOnNext: { backgroundColor: 'rgba(255,255,255,0.18)' },
    playBtnActive: { backgroundColor: C.primary },

    // ===== NOTIFICATION =====
    notifCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: C.surface, borderRadius: SIZES.radius, padding: 14,
        marginHorizontal: 20, marginTop: 20,
        borderWidth: 1, borderColor: C.divider,
    },
    notifLeft: { flexDirection: 'row', alignItems: 'center' },
    notifIcon: {
        width: 36, height: 36, borderRadius: 10, backgroundColor: C.surfaceAlt,
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    notifIconActive: { backgroundColor: C.primary },
    notifTitle: { fontSize: SIZES.font, fontWeight: '600', color: C.textPrimary },
    notifSub: { fontSize: SIZES.caption, color: C.textMuted, marginTop: 1 },
    toggleBtn: {
        width: 48, height: 28, borderRadius: 14, backgroundColor: C.border,
        justifyContent: 'center', paddingHorizontal: 3,
    },
    toggleBtnActive: { backgroundColor: C.primary },
    toggleDot: {
        width: 22, height: 22, borderRadius: 11, backgroundColor: C.white, ...SHADOWS.soft,
    },
    toggleDotActive: { alignSelf: 'flex-end' },

    // ===== INFO =====
    infoCard: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 20, marginTop: 12, paddingVertical: 10,
    },
    infoText: { fontSize: SIZES.caption, color: C.textMuted, marginLeft: 6 },

    // ===== AUDIO PLAYER =====
    audioPlayer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: C.surface, borderTopLeftRadius: SIZES.radiusLg, borderTopRightRadius: SIZES.radiusLg,
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32,
        shadowColor: C.primary, shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.08, shadowRadius: 20, elevation: 20,
    },
    playerRow: { flexDirection: 'row', alignItems: 'center' },
    playerIconBox: {
        width: 40, height: 40, borderRadius: 12, backgroundColor: C.primarySoft,
        justifyContent: 'center', alignItems: 'center',
    },
    playerTitle: { fontSize: SIZES.font, fontWeight: '700', color: C.textPrimary },
    playerSub: { fontSize: SIZES.caption, color: C.textMuted, marginTop: 1 },
    playerClose: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },

    progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, marginBottom: 8 },
    progressTime: { fontSize: 10, color: C.textMuted, fontWeight: '600', width: 34, textAlign: 'center' },
    progressTrack: { flex: 1, height: 4, backgroundColor: C.divider, borderRadius: 2, marginHorizontal: 6 },
    progressFill: { height: '100%', backgroundColor: C.primary, borderRadius: 2 },
    progressThumb: {
        position: 'absolute', top: -4, width: 12, height: 12, borderRadius: 6,
        backgroundColor: C.primary, marginLeft: -6,
        shadowColor: C.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3,
    },

    controlsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16 },
    ctrlBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    ctrlPlayBtn: {
        width: 56, height: 56, borderRadius: 28, backgroundColor: C.primary,
        justifyContent: 'center', alignItems: 'center', marginHorizontal: 8,
        ...SHADOWS.strong,
    },
});

export default PrayerTimesScreen;
