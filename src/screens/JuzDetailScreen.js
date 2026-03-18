import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, ActivityIndicator,
    TouchableOpacity, Animated,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import { QURAN_AUDIO_CDN } from '../constants/apiUrls';
import { saveLastRead, getLastReadJuz } from '../services/lastReadService';
import { fetchJuzDetail } from '../services/apiService';
import { useSettings } from '../context/SettingsContext';

const JuzDetailScreen = ({ route, navigation }) => {
    const { colors: COLORS, t } = useSettings();
    const styles = makeStyles(COLORS);
    const { juz, scrollToAyah } = route.params;
    const [ayahs, setAyahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTranslation, setShowTranslation] = useState(true);
    const [showLatin, setShowLatin] = useState(true);
    const [fontSize, setFontSize] = useState(SIZES.arabicLarge);
    const [currentPlayingAyah, setCurrentPlayingAyah] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [autoPlay, setAutoPlay] = useState(true);
    const [audioLoading, setAudioLoading] = useState(false);
    const [markedAyah, setMarkedAyah] = useState(null);

    const soundRef = useRef(null);
    const flatListRef = useRef(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isPlaying) {
            const p = Animated.loop(Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.1, duration: 700, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            ]));
            p.start();
            return () => p.stop();
        } else { pulseAnim.setValue(1); }
    }, [isPlaying]);

    useEffect(() => { return () => { stopAudio(); }; }, []);
    useEffect(() => { fetchJuz(); loadMarked(); }, []);

    // Auto-scroll to marked ayah after data loads
    useEffect(() => {
        const target = scrollToAyah || markedAyah;
        if (ayahs.length > 0 && target) {
            setMarkedAyah(target);
            const idx = ayahs.findIndex((a) => a.number === target);
            if (idx >= 0 && flatListRef.current) {
                setTimeout(() => {
                    try { flatListRef.current.scrollToIndex({ index: idx, animated: true, viewPosition: 0.2 }); }
                    catch (e) { flatListRef.current.scrollToOffset({ offset: idx * 200, animated: true }); }
                }, 500);
            }
        }
    }, [ayahs, scrollToAyah, markedAyah]);

    const loadMarked = async () => {
        const data = await getLastReadJuz();
        if (data && data.juzNumber === juz.number) {
            setMarkedAyah(data.ayahNumber);
        }
    };

    const markAsLastRead = (item) => {
        setMarkedAyah(item.number);
        saveLastRead({
            surahNumber: item.surahNumber, surahName: item.surahName, surahArabic: item.surahArabic,
            ayahNumber: item.number, ayahNumberInSurah: item.numberInSurah,
            type: 'juz', juzNumber: juz.number, juzName: juz.name,
        });
    };

    const fetchJuz = async () => {
        try {
            const ayahs = await fetchJuzDetail(juz.number);
            setAyahs(ayahs);
        } catch (e) {
            console.error('Error fetching juz:', e);
        } finally {
            setLoading(false);
        }
    };

    const stopAudio = async () => {
        if (soundRef.current) {
            try { await soundRef.current.stopAsync(); await soundRef.current.unloadAsync(); } catch (e) { }
            soundRef.current = null;
        }
        setIsPlaying(false); setCurrentPlayingAyah(null); setAudioLoading(false);
    };

    const playAyah = useCallback(async (ayah, index) => {
        try {
            if (soundRef.current) { await soundRef.current.stopAsync(); await soundRef.current.unloadAsync(); soundRef.current = null; }
            setAudioLoading(true); setCurrentPlayingAyah(ayah.number);
            await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true, staysActiveInBackground: true });
            const { sound } = await Audio.Sound.createAsync({ uri: ayah.audio || `${QURAN_AUDIO_CDN}/${ayah.number}.mp3` }, { shouldPlay: true });
            soundRef.current = sound; setIsPlaying(true); setAudioLoading(false);
            if (flatListRef.current) { try { flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.3 }); } catch (e) { } }
            sound.setOnPlaybackStatusUpdate((s) => {
                if (s.didJustFinish) {
                    if (autoPlay && index < ayahs.length - 1) playAyah(ayahs[index + 1], index + 1);
                    else { setIsPlaying(false); setCurrentPlayingAyah(null); }
                }
            });
        } catch (e) { setAudioLoading(false); setIsPlaying(false); setCurrentPlayingAyah(null); }
    }, [ayahs, autoPlay]);

    const togglePlayPause = async () => {
        if (!soundRef.current) return;
        const s = await soundRef.current.getStatusAsync();
        if (s.isPlaying) { await soundRef.current.pauseAsync(); setIsPlaying(false); }
        else { await soundRef.current.playAsync(); setIsPlaying(true); }
    };

    const playNext = () => { const i = ayahs.findIndex((a) => a.number === currentPlayingAyah); if (i < ayahs.length - 1) playAyah(ayahs[i + 1], i + 1); };
    const playPrev = () => { const i = ayahs.findIndex((a) => a.number === currentPlayingAyah); if (i > 0) playAyah(ayahs[i - 1], i - 1); };

    // Group ayahs by surah for section headers
    const getSurahForAyah = (index) => {
        if (index === 0) return ayahs[0];
        if (ayahs[index].surahNumber !== ayahs[index - 1].surahNumber) return ayahs[index];
        return null;
    };

    const renderHeader = () => (
        <View>
            <View style={styles.banner}>
                <View style={styles.bannerDecor}>
                    {[...Array(5)].map((_, i) => <View key={i} style={[styles.decorDot, { opacity: 0.1 + i * 0.05 }]} />)}
                </View>
                <Text style={styles.bannerJuzNumber}>Juz {juz.number}</Text>
                <Text style={styles.bannerJuzName}>{juz.name}</Text>
                <View style={styles.bannerMeta}>
                    <View style={styles.metaChip}>
                        <Ionicons name="book-outline" size={12} color="rgba(255,255,255,0.6)" />
                        <Text style={styles.metaChipText}>{juz.startSurah} {juz.startAyah?.split(':')[1]}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={12} color="rgba(255,255,255,0.4)" />
                    <View style={styles.metaChip}>
                        <Ionicons name="book-outline" size={12} color="rgba(255,255,255,0.6)" />
                        <Text style={styles.metaChipText}>{juz.endSurah} {juz.endAyah?.split(':')[1]}</Text>
                    </View>
                </View>
                {!loading && <Text style={styles.bannerCount}>{ayahs.length} Ayat</Text>}
            </View>

            <View style={styles.controlsRow}>
                <TouchableOpacity style={[styles.chip, showLatin && styles.chipActive]} onPress={() => setShowLatin(!showLatin)}>
                    <Ionicons name="text-outline" size={14} color={showLatin ? COLORS.white : COLORS.primary} />
                    <Text style={[styles.chipText, showLatin && styles.chipTextActive]}>{t.latin}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.chip, showTranslation && styles.chipActive]} onPress={() => setShowTranslation(!showTranslation)}>
                    <Ionicons name="language-outline" size={14} color={showTranslation ? COLORS.white : COLORS.primary} />
                    <Text style={[styles.chipText, showTranslation && styles.chipTextActive]}>{t.translation}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.chip, autoPlay && styles.chipActive]} onPress={() => setAutoPlay(!autoPlay)}>
                    <Ionicons name="play-forward-outline" size={14} color={autoPlay ? COLORS.white : COLORS.primary} />
                    <Text style={[styles.chipText, autoPlay && styles.chipTextActive]}>{t.auto_play}</Text>
                </TouchableOpacity>
                <View style={styles.fontControls}>
                    <TouchableOpacity style={styles.fontBtn} onPress={() => setFontSize((p) => Math.max(22, p - 2))}>
                        <Text style={styles.fontBtnText}>A-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.fontBtn} onPress={() => setFontSize((p) => Math.min(46, p + 2))}>
                        <Text style={styles.fontBtnText}>A+</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderAyah = ({ item, index }) => {
        const isCurrent = currentPlayingAyah === item.number;
        const isMarked = markedAyah === item.number;
        const surahHeader = getSurahForAyah(index);

        return (
            <View>
                {/* Surah divider */}
                {surahHeader && (
                    <View style={styles.surahDivider}>
                        <View style={styles.surahDividerLine} />
                        <View style={styles.surahDividerContent}>
                            <Text style={styles.surahDividerArabic}>{item.surahArabic}</Text>
                            <Text style={styles.surahDividerName}>{item.surahName}</Text>
                        </View>
                        <View style={styles.surahDividerLine} />
                    </View>
                )}

                <View style={[styles.ayahCard, isCurrent && styles.ayahCardPlaying, isMarked && !isCurrent && styles.ayahCardMarked]}>
                    {/* Marked badge */}
                    {isMarked && (
                        <View style={styles.markedBadge}>
                            <Ionicons name="bookmark" size={10} color={COLORS.white} />
                            <Text style={styles.markedBadgeText}>{t.last_read_badge}</Text>
                        </View>
                    )}

                    <View style={styles.ayahTopRow}>
                        <Animated.View style={[
                            styles.ayahBadge,
                            isCurrent && styles.ayahBadgePlaying,
                            isMarked && !isCurrent && styles.ayahBadgeMarked,
                            isCurrent && isPlaying && { transform: [{ scale: pulseAnim }] },
                        ]}>
                            <Text style={[styles.ayahBadgeText, (isCurrent || isMarked) && { color: COLORS.white }]}>{item.numberInSurah}</Text>
                        </Animated.View>

                        <Text style={styles.ayahSurahRef}>{item.surahName} : {item.numberInSurah}</Text>

                        <View style={styles.ayahActions}>
                            <TouchableOpacity
                                style={[styles.actionBtn, isCurrent && isPlaying && styles.actionBtnActive]}
                                onPress={() => isCurrent ? togglePlayPause() : playAyah(item, index)}
                            >
                                {audioLoading && isCurrent ? (
                                    <ActivityIndicator size={14} color={COLORS.primary} />
                                ) : (
                                    <Ionicons name={isCurrent && isPlaying ? 'pause' : 'play'} size={14} color={isCurrent && isPlaying ? COLORS.white : COLORS.primary} />
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, isMarked && styles.actionBtnMarked]}
                                onPress={() => markAsLastRead(item)}
                            >
                                <Ionicons name={isMarked ? 'bookmark' : 'bookmark-outline'} size={14} color={isMarked ? COLORS.white : COLORS.textMuted} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {isCurrent && isPlaying && (
                        <View style={styles.playingRow}>
                            {[...Array(8)].map((_, i) => <View key={i} style={[styles.eqBar, { height: 4 + Math.random() * 10 }]} />)}
                            <Text style={styles.playingLabel}>{t.now_playing}</Text>
                        </View>
                    )}

                    <Text style={[styles.arabicText, { fontSize }]}>{item.text}</Text>

                    {showLatin && item.latin && (
                        <Text style={styles.latinText}>{item.latin}</Text>
                    )}

                    {showTranslation && item.translation && (
                        <View style={styles.translationBox}>
                            <Text style={styles.translationText}>{item.translation}</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const renderPlayer = () => {
        if (currentPlayingAyah === null) return null;
        const idx = ayahs.findIndex((a) => a.number === currentPlayingAyah);
        const current = ayahs[idx];

        return (
            <View style={styles.player}>
                <View style={styles.playerInfo}>
                    <View style={styles.playerIcon}>
                        <Ionicons name="musical-notes" size={16} color={COLORS.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.playerTitle}>Juz {juz.number} · {current?.surahName} : {current?.numberInSurah}</Text>
                        <Text style={styles.playerSub}>{idx + 1} dari {ayahs.length} ayat</Text>
                    </View>
                    <TouchableOpacity onPress={stopAudio}>
                        <Ionicons name="close" size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>

                <View style={styles.playerProgress}>
                    <View style={[styles.playerProgressFill, { width: `${((idx + 1) / ayahs.length) * 100}%` }]} />
                </View>

                <View style={styles.playerControls}>
                    <TouchableOpacity onPress={playPrev} style={styles.pCtrlBtn} disabled={idx <= 0}>
                        <Ionicons name="play-skip-back" size={20} color={idx > 0 ? COLORS.textPrimary : COLORS.border} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={togglePlayPause} style={styles.pPlayBtn}>
                        {audioLoading ? <ActivityIndicator size="small" color={COLORS.white} />
                            : <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color={COLORS.white} />}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={playNext} style={styles.pCtrlBtn} disabled={idx >= ayahs.length - 1}>
                        <Ionicons name="play-skip-forward" size={20} color={idx < ayahs.length - 1 ? COLORS.textPrimary : COLORS.border} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setAutoPlay(!autoPlay)} style={styles.pCtrlBtn}>
                        <Ionicons name="play-forward" size={18} color={autoPlay ? COLORS.primary : COLORS.textMuted} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.nav}>
                <TouchableOpacity onPress={() => { stopAudio(); navigation.goBack(); }} style={styles.navBtn}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Juz {juz.number}</Text>
                <TouchableOpacity style={styles.navBtn} onPress={() => ayahs.length > 0 && playAyah(ayahs[0], 0)}>
                    <Ionicons name="play-circle" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Memuat Juz {juz.number}...</Text>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={ayahs}
                    keyExtractor={(item) => item.number.toString()}
                    renderItem={renderAyah}
                    ListHeaderComponent={renderHeader}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.list, currentPlayingAyah !== null && { paddingBottom: 150 }]}
                    onScrollToIndexFailed={(info) => { flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true }); }}
                />
            )}

            {renderPlayer()}
        </View>
    );
};

const makeStyles = (C) => ({
    container: { flex: 1, backgroundColor: C.background },

    nav: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: C.primary, paddingTop: 10, paddingBottom: 12, paddingHorizontal: 16,
    },
    navBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    navTitle: { fontSize: SIZES.large, fontWeight: '700', color: C.white, letterSpacing: -0.3 },

    banner: {
        backgroundColor: C.primary, paddingVertical: 28, paddingHorizontal: 24, alignItems: 'center',
        borderBottomLeftRadius: SIZES.radiusXl, borderBottomRightRadius: SIZES.radiusXl,
    },
    bannerDecor: { flexDirection: 'row', marginBottom: 12 },
    decorDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.white, marginHorizontal: 4 },
    bannerJuzNumber: { fontSize: SIZES.caption, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 },
    bannerJuzName: { fontSize: SIZES.header, fontWeight: '700', color: C.white, marginTop: 4 },
    bannerMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 8 },
    metaChip: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    metaChipText: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
    bannerCount: { fontSize: SIZES.small, color: C.accent, fontWeight: '600', marginTop: 10 },

    controlsRow: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8,
    },
    chip: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7,
        borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface,
    },
    chipActive: { backgroundColor: C.primary, borderColor: C.primary },
    chipText: { fontSize: 11, color: C.primary, fontWeight: '600', marginLeft: 5 },
    chipTextActive: { color: C.white },
    fontControls: { flexDirection: 'row', marginLeft: 'auto', gap: 6 },
    fontBtn: {
        width: 34, height: 34, borderRadius: 10, borderWidth: 1, borderColor: C.border,
        backgroundColor: C.surface, justifyContent: 'center', alignItems: 'center',
    },
    fontBtnText: { fontSize: 12, fontWeight: '700', color: C.primary },

    list: { paddingBottom: 30 },

    // Surah divider
    surahDivider: {
        flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginVertical: 12,
    },
    surahDividerLine: { flex: 1, height: 1, backgroundColor: C.accent + '30' },
    surahDividerContent: { alignItems: 'center', marginHorizontal: 14 },
    surahDividerArabic: { fontSize: 18, color: C.accent },
    surahDividerName: { fontSize: SIZES.caption, color: C.textMuted, marginTop: 2 },

    ayahCard: {
        backgroundColor: C.surface, marginHorizontal: 12, marginVertical: 4,
        borderRadius: SIZES.radius, padding: 18, borderWidth: 1, borderColor: C.divider,
    },
    ayahCardPlaying: { backgroundColor: C.primarySoft, borderColor: C.primary, borderWidth: 1.5 },
    ayahCardMarked: { backgroundColor: C.accentLight, borderColor: C.accent, borderWidth: 1.5 },
    markedBadge: {
        flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
        backgroundColor: C.accent, paddingHorizontal: 8, paddingVertical: 3,
        borderRadius: 6, marginBottom: 10,
    },
    markedBadgeText: { fontSize: 9, color: C.white, fontWeight: '700', marginLeft: 4 },
    ayahTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    ayahBadge: {
        width: 36, height: 36, borderRadius: 10, backgroundColor: C.surfaceAlt,
        justifyContent: 'center', alignItems: 'center',
    },
    ayahBadgePlaying: { backgroundColor: C.accent },
    ayahBadgeMarked: { backgroundColor: C.accent },
    ayahBadgeText: { fontSize: SIZES.small, fontWeight: '700', color: C.textSecondary },
    ayahSurahRef: { flex: 1, fontSize: SIZES.caption, color: C.textMuted, marginLeft: 10 },
    ayahActions: { flexDirection: 'row', gap: 4 },
    actionBtn: {
        width: 32, height: 32, borderRadius: 8, backgroundColor: C.surfaceAlt,
        justifyContent: 'center', alignItems: 'center',
    },
    actionBtnActive: { backgroundColor: C.primary },
    actionBtnMarked: { backgroundColor: C.accent },

    playingRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10, gap: 2 },
    eqBar: { width: 3, backgroundColor: C.primary, borderRadius: 1.5 },
    playingLabel: { fontSize: 10, color: C.primary, fontWeight: '600', marginLeft: 6, alignSelf: 'center' },

    arabicText: { color: C.textPrimary, textAlign: 'right', lineHeight: 58, marginBottom: 10 },
    latinText: { fontSize: SIZES.font, color: C.primary, fontStyle: 'italic', lineHeight: 22, marginBottom: 10 },

    translationBox: { backgroundColor: C.surfaceAlt, borderRadius: 10, padding: 14, marginTop: 4 },
    translationText: { fontSize: SIZES.font, color: C.textSecondary, lineHeight: 22 },

    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: SIZES.font, color: C.textMuted, marginTop: 12 },

    player: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: C.surface, borderTopLeftRadius: SIZES.radiusLg, borderTopRightRadius: SIZES.radiusLg,
        paddingHorizontal: 20, paddingTop: 14, paddingBottom: 32,
        borderTopWidth: 1, borderColor: C.divider,
    },
    playerInfo: { flexDirection: 'row', alignItems: 'center' },
    playerIcon: {
        width: 38, height: 38, borderRadius: 10, backgroundColor: C.primarySoft,
        justifyContent: 'center', alignItems: 'center',
    },
    playerTitle: { fontSize: SIZES.font, fontWeight: '700', color: C.textPrimary },
    playerSub: { fontSize: SIZES.caption, color: C.textMuted, marginTop: 1 },
    playerProgress: { height: 3, backgroundColor: C.divider, borderRadius: 2, marginTop: 12, marginBottom: 10 },
    playerProgressFill: { height: '100%', backgroundColor: C.primary, borderRadius: 2 },
    playerControls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16 },
    pCtrlBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    pPlayBtn: {
        width: 52, height: 52, borderRadius: 26, backgroundColor: C.primary,
        justifyContent: 'center', alignItems: 'center',
    },
});

export default JuzDetailScreen;
